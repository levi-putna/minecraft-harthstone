import { world, system, ItemStack } from "@minecraft/server";

const ITEM_ID = "hs:hearthstone";
const CHANNEL_TICKS = 100; // 5 seconds at 20 ticks/second
const STARTER_TAG = "hs_got_starter_hearthstone";
const BAR_LENGTH = 20;

/** playerId -> { player, ticks } */
const channels = new Map();

function giveHearthstone(player) {
  const item = new ItemStack(ITEM_ID, 1);
  const leftover = player.getComponent("minecraft:inventory").container.addItem(item);
  if (leftover) player.dimension.spawnItem(leftover, player.location);
}

function cancelChannel(player, reason) {
  if (!channels.delete(player.id)) return;
  player.onScreenDisplay.setActionBar(`§cHearthstone interrupted: ${reason}`);
  player.playSound("note.bass");
}

function teleportHome(player) {
  const spawn = player.getSpawnPoint(); // bed / respawn anchor, if set
  if (spawn) {
    player.teleport(
      { x: spawn.x + 0.5, y: spawn.y + 1, z: spawn.z + 0.5 },
      { dimension: spawn.dimension }
    );
  } else {
    // No bed: fall back to world spawn in the overworld.
    const overworld = world.getDimension("overworld");
    const ws = world.getDefaultSpawnLocation();
    // Bedrock reports y = 32767 when the spawn height isn't known yet.
    const unknownHeight = ws.y > 320;
    player.teleport(
      { x: ws.x + 0.5, y: unknownHeight ? 320 : ws.y, z: ws.z + 0.5 },
      { dimension: overworld }
    );
    if (unknownHeight) {
      // Wait for the chunk to load, then drop the player onto the ground.
      system.runTimeout(() => {
        if (!player.isValid) return;
        const top = overworld.getTopmostBlock({ x: ws.x, z: ws.z });
        if (top) player.teleport({ x: ws.x + 0.5, y: top.location.y + 1, z: ws.z + 0.5 });
      }, 10);
    }
  }
  player.playSound("mob.endermen.portal");
  player.onScreenDisplay.setActionBar("§bYou feel the warmth of home.");
}

// Using the stone starts a 5 second channel.
world.afterEvents.itemUse.subscribe(({ source: player, itemStack }) => {
  if (itemStack?.typeId !== ITEM_ID) return;
  if (channels.has(player.id)) return; // already channeling
  channels.set(player.id, { player, ticks: 0 });
  player.playSound("beacon.activate");
});

// Any damage interrupts the channel.
world.afterEvents.entityHurt.subscribe(
  ({ hurtEntity }) => {
    if (channels.has(hurtEntity.id)) cancelChannel(hurtEntity, "you took damage");
  },
  { entityTypes: ["minecraft:player"] }
);

world.afterEvents.playerLeave.subscribe(({ playerId }) => channels.delete(playerId));

// Progress bar, particles, and the teleport once the channel finishes.
system.runInterval(() => {
  for (const [id, channel] of channels) {
    const { player } = channel;
    if (!player.isValid) {
      channels.delete(id);
      continue;
    }
    channel.ticks += 2;

    if (channel.ticks >= CHANNEL_TICKS) {
      channels.delete(id);
      teleportHome(player);
      continue;
    }

    const filled = Math.floor((channel.ticks / CHANNEL_TICKS) * BAR_LENGTH);
    const secondsLeft = ((CHANNEL_TICKS - channel.ticks) / 20).toFixed(1);
    player.onScreenDisplay.setActionBar(
      `§bHearthstone §f[§b${"|".repeat(filled)}§7${"|".repeat(BAR_LENGTH - filled)}§f] ${secondsLeft}s`
    );
    const { x, y, z } = player.location;
    player.dimension.spawnParticle("minecraft:portal_reverse_particle", { x, y: y + 1, z });
  }
}, 2);

// Every player gets one stone the first time they join with the add-on active.
world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
  if (!initialSpawn || player.hasTag(STARTER_TAG)) return;
  giveHearthstone(player);
  player.addTag(STARTER_TAG);
  player.sendMessage("§bYou received a Hearthstone. Use it to return home after 5 seconds.");
});
