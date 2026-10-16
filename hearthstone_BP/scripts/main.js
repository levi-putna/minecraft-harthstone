import { world, system, ItemStack } from "@minecraft/server";

const ITEM_ID = "hs:hearthstone";
const CHANNEL_TICKS = 100; // 5 seconds at 20 ticks/second; the teleport fires here
const STARTER_TAG = "hs_got_starter_hearthstone";
const BAR_LENGTH = 20;

// Rising ring of flames around the player while channeling.
const RING_PARTICLE = "minecraft:blue_flame_particle";
const RING_POINTS = 12;
const RING_RADIUS = 1;
const RING_RISE = 2; // blocks climbed from feet over the full channel

// The player floats up half a block: they stay grounded while the power
// builds, then rise from 2 s right up to the teleport at 5 s. Walking breaks
// the channel; looking around doesn't.
const HOVER_HEIGHT = 0.5;
const HOVER_RISE_START = 40;
const HOVER_RISE_END = 100; // CHANNEL_TICKS
const MOVE_TOLERANCE = 0.1; // horizontal blocks of drift allowed per tick

// Timeline of the departure, in channel ticks.
const WOBBLE_START = 60; // nausea warp + portal hum begin
const WOBBLE_TICKS = 45;
const FADE_START = 90; // screen fades to dark blue, fully covered by CHANNEL_TICKS
const ARRIVAL_DELAY = 20; // ticks after the teleport before the fade clears

const FADE_COLOR = { red: 0.02, green: 0.05, blue: 0.25 };
const FADE_IN = 0.5; // seconds, matches FADE_START -> CHANNEL_TICKS
const FADE_HOLD = 1;
const FADE_OUT = 0.75;

const BURST_POINTS = 24;
const BURST_PARTICLES = [RING_PARTICLE, "minecraft:soul_particle"];

// Ticking areas preload the destination during the channel. Their names are
// saved so any left behind by a crash or restart get removed on world load.
const AREAS_PROPERTY = "hs:tickingAreas";

// Fallback respawn without a bed, following the spawnRadius game rule.
const DEFAULT_SPAWN_RADIUS = 5;
const SPAWN_ATTEMPTS = 10;
const SPAWN_SEARCH_RADIUS = 8; // stays inside the 2-chunk preloaded area

/** playerId -> { player, ticks, anchor, destination, area } */
const channels = new Map();

function giveHearthstone(player) {
  const item = new ItemStack(ITEM_ID, 1);
  const leftover = player.getComponent("minecraft:inventory").container.addItem(item);
  if (leftover) player.dimension.spawnItem(leftover, player.location);
}

function tryCommand(target, command) {
  try {
    target.runCommand(command);
  } catch {
    // Missing area, full ticking area limit, etc. Effects are best effort.
  }
}

// Where the stone will send the player: their bed / respawn anchor, or, like
// a normal respawn without one, a random point within the spawnRadius game
// rule of the world spawn. World spawn destinations have no `y`; the ground
// is found at teleport time, once the ticking area has loaded it.
function getDestination(player) {
  const spawn = player.getSpawnPoint();
  if (spawn) {
    return { dimension: spawn.dimension, x: spawn.x + 0.5, y: spawn.y + 1, z: spawn.z + 0.5 };
  }
  const ws = world.getDefaultSpawnLocation();
  const { x, z } = randomPointNear(ws, world.gameRules.spawnRadius ?? DEFAULT_SPAWN_RADIUS);
  return { dimension: world.getDimension("overworld"), x, z };
}

function randomPointNear(center, radius) {
  const angle = Math.random() * Math.PI * 2;
  const r = Math.sqrt(Math.random()) * radius;
  return {
    x: Math.floor(center.x + Math.cos(angle) * r) + 0.5,
    z: Math.floor(center.z + Math.sin(angle) * r) + 0.5,
  };
}

// Standing height on the topmost block, or undefined if the chunk isn't
// loaded or the surface there is water or lava (not a valid spawn).
function safeGroundY(dimension, x, z) {
  try {
    const top = dimension.getTopmostBlock({ x, z });
    if (!top || top.isLiquid) return undefined;
    return top.location.y + 1;
  } catch {
    return undefined; // chunk not loaded yet
  }
}

// Try the chosen point, then nearby points inside the preloaded area, until
// one has dry ground to stand on.
function findSpawnSpot(dimension, center) {
  for (let i = 0; i < SPAWN_ATTEMPTS; i++) {
    const { x, z } = i === 0 ? center : randomPointNear(center, SPAWN_SEARCH_RADIUS);
    const y = safeGroundY(dimension, x, z);
    if (y !== undefined) return { x, y, z };
  }
  return undefined;
}

function savedAreas() {
  return JSON.parse(world.getDynamicProperty(AREAS_PROPERTY) ?? "[]");
}

function addArea(player, destination) {
  const area = { name: `hs_${player.id}`, dimension: destination.dimension.id };
  const { x, z } = destination;
  tryCommand(destination.dimension, `tickingarea add circle ${Math.floor(x)} 64 ${Math.floor(z)} 2 "${area.name}"`);
  world.setDynamicProperty(AREAS_PROPERTY, JSON.stringify([...savedAreas(), area]));
  return area;
}

function removeArea(area) {
  tryCommand(world.getDimension(area.dimension), `tickingarea remove "${area.name}"`);
  const remaining = savedAreas().filter((a) => a.name !== area.name);
  world.setDynamicProperty(AREAS_PROPERTY, JSON.stringify(remaining));
}

// Undo everything the channel put on the player. Particles already spawned
// are left to drift away.
function clearChannelEffects(player) {
  player.removeEffect("slow_falling");
  player.removeEffect("nausea");
  player.camera.clear(); // cancels an in-progress fade
  tryCommand(player, "stopsound @s portal.trigger");
}

function endChannel(id) {
  const channel = channels.get(id);
  if (!channel) return undefined;
  channels.delete(id);
  removeArea(channel.area);
  return channel;
}

function cancelChannel(player, reason) {
  if (!endChannel(player.id)) return;
  clearChannelEffects(player);
  player.onScreenDisplay.setActionBar(`§cHearthstone interrupted: ${reason}`);
  player.playSound("note.bass");
}

// A burst of blue flames and souls that drift up and away.
function spawnBurst(dimension, center) {
  for (let i = 0; i < BURST_POINTS; i++) {
    const angle = (i / BURST_POINTS) * Math.PI * 2;
    const r = 0.4 + Math.random() * 0.8;
    try {
      dimension.spawnParticle(BURST_PARTICLES[i % BURST_PARTICLES.length], {
        x: center.x + Math.cos(angle) * r,
        y: center.y + Math.random() * 2,
        z: center.z + Math.sin(angle) * r,
      });
    } catch {
      return; // chunk not loaded
    }
  }
}

function teleportHome(player, destination) {
  const { dimension } = destination;
  // Bed / anchor destinations already have a height. For world spawn, the
  // ticking area should have loaded the ground during the channel.
  const spot = destination.y !== undefined ? destination : findSpawnSpot(dimension, destination);
  player.removeEffect("slow_falling");

  if (spot) {
    player.teleport({ x: spot.x, y: spot.y, z: spot.z }, { dimension });
  } else {
    // Ground still wasn't ready: wait up high, safely, until it is.
    const { x, z } = destination;
    player.teleport({ x, y: 320, z }, { dimension });
    player.addEffect("slow_falling", 200, { showParticles: false });
    const poll = system.runInterval(() => {
      if (!player.isValid) return system.clearRun(poll);
      const found = findSpawnSpot(dimension, destination);
      if (!found) return;
      system.clearRun(poll);
      player.teleport(found);
      player.removeEffect("slow_falling");
    }, 5);
  }
  player.playSound("mob.endermen.portal");

  system.runTimeout(() => {
    if (!player.isValid) return;
    spawnBurst(player.dimension, player.location);
    player.playSound("chime.amethyst_block");
    player.onScreenDisplay.setActionBar("§bYou feel the warmth of home.");
  }, ARRIVAL_DELAY);
}

// A full circle of blue flames around the player that spins and rises from
// their feet to above their head as the channel progresses.
function spawnRing(player, base, progress) {
  const height = base.y + 0.1 + progress * RING_RISE;
  const spin = progress * Math.PI * 4; // two full turns over the channel
  for (let i = 0; i < RING_POINTS; i++) {
    const angle = spin + (i / RING_POINTS) * Math.PI * 2;
    player.dimension.spawnParticle(RING_PARTICLE, {
      x: base.x + Math.cos(angle) * RING_RADIUS,
      y: height,
      z: base.z + Math.sin(angle) * RING_RADIUS,
    });
  }
}

// Using the stone starts a 5 second channel.
world.afterEvents.itemUse.subscribe(({ source: player, itemStack }) => {
  if (itemStack?.typeId !== ITEM_ID) return;
  if (channels.has(player.id)) return; // already channeling
  const destination = getDestination(player);
  channels.set(player.id, {
    player,
    ticks: 0,
    anchor: { ...player.location },
    destination,
    area: addArea(player, destination),
  });
  player.addEffect("slow_falling", CHANNEL_TICKS + 20, { showParticles: false });
  player.playSound("beacon.activate");
});

// Any damage interrupts the channel.
world.afterEvents.entityHurt.subscribe(
  ({ hurtEntity }) => {
    if (channels.has(hurtEntity.id)) cancelChannel(hurtEntity, "you took damage");
  },
  { entityTypes: ["minecraft:player"] }
);

world.afterEvents.playerLeave.subscribe(({ playerId }) => endChannel(playerId));

// Clean up ticking areas left behind if the world closed mid-channel.
world.afterEvents.worldLoad.subscribe(() => {
  for (const area of savedAreas()) removeArea(area);
});

// Hover, progress bar, effects, and the teleport once the channel finishes.
system.runInterval(() => {
  for (const [id, channel] of channels) {
    const { player, anchor } = channel;
    if (!player.isValid) {
      endChannel(id);
      continue;
    }

    // Looking around is fine; walking breaks the channel.
    const { x, z } = player.location;
    if (Math.hypot(x - anchor.x, z - anchor.z) > MOVE_TOLERANCE) {
      cancelChannel(player, "you moved");
      continue;
    }

    channel.ticks += 1;
    const { ticks } = channel;

    if (ticks >= CHANNEL_TICKS) {
      endChannel(id);
      teleportHome(player, channel.destination);
      continue;
    }

    const t = Math.min(1, Math.max(0, (ticks - HOVER_RISE_START) / (HOVER_RISE_END - HOVER_RISE_START)));
    const lift = HOVER_HEIGHT * t * t; // starts slow and speeds up into the teleport
    player.teleport({ x: anchor.x, y: anchor.y + lift, z: anchor.z });

    if (ticks === WOBBLE_START) {
      player.addEffect("nausea", WOBBLE_TICKS, { showParticles: false });
      player.playSound("portal.trigger", { volume: 0.6 });
    }
    if (ticks === FADE_START) {
      spawnBurst(player.dimension, anchor);
      player.camera.fade({
        fadeColor: FADE_COLOR,
        fadeTime: { fadeInTime: FADE_IN, holdTime: FADE_HOLD, fadeOutTime: FADE_OUT },
      });
    }

    if (ticks % 2 === 0) {
      const filled = Math.floor((ticks / CHANNEL_TICKS) * BAR_LENGTH);
      const secondsLeft = ((CHANNEL_TICKS - ticks) / 20).toFixed(1);
      player.onScreenDisplay.setActionBar(
        `§bHearthstone §f[§b${"|".repeat(filled)}§7${"|".repeat(BAR_LENGTH - filled)}§f] ${secondsLeft}s`
      );
      spawnRing(player, anchor, ticks / CHANNEL_TICKS);
    }
  }
}, 1);

// Every player gets one stone the first time they join with the add-on active.
world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
  if (!initialSpawn || player.hasTag(STARTER_TAG)) return;
  giveHearthstone(player);
  player.addTag(STARTER_TAG);
  player.sendMessage("§bYou received a Hearthstone. Use it to return home after 5 seconds.");
});
