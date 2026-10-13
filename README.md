# Hearthstone (Minecraft Bedrock add-on)

<img src="hearthstone_BP/pack_icon.png" width="96" align="right" alt="Hearthstone icon">

A Hearthstone for Minecraft Bedrock Edition. Use it, stand your ground for 5 seconds, and you're teleported home. Take any damage while channeling and the spell is interrupted.

## Features

- **5 second channel:** a progress bar shows on screen while you channel, with portal particles around you.
- **Damage interrupts:** any damage (mobs, falling, fire, other players) cancels the channel. You can start again straight away.
- **Teleports home:** you go to your bed or respawn anchor, even from the Nether or the End. If you haven't set one, you go to world spawn.
- **Free starter stone:** every player gets one Hearthstone the first time they join a world with the add-on turned on. This also works in existing worlds.
- **Reusable:** the stone isn't used up.
- **Craftable:** you can make more at a crafting table.

## Requirements

- Minecraft Bedrock Edition **1.21.90 or newer** (Windows, Xbox, mobile, or Bedrock Dedicated Server).

## Installation (Windows)

1. Download `hearthstone.mcaddon` from the [Releases](../../releases) page, or build it yourself (see [Building from source](#building-from-source)).
2. **Double-click `hearthstone.mcaddon`.** Minecraft opens and shows "Successfully imported" for two packs: *Hearthstone* and *Hearthstone Resources*.
   - If nothing happens, right-click the file, choose **Open with**, and pick **Minecraft**.
3. On the **Play** screen, click the ✏️ pencil icon next to your world, or use **Create New** for a new world.
4. Go to **Behavior Packs**, then **Available**, select **Hearthstone**, and press **Activate**.
5. Accept the prompt to also turn on the resource pack. It's linked, so it switches on automatically.
6. Load the world. You'll get a Hearthstone and a chat message saying "You received a Hearthstone."

### Updating

Double-click the newer `hearthstone.mcaddon`. It replaces the old version. Your world keeps the pack turned on.

### Bedrock Dedicated Server

1. Rename `hearthstone.mcaddon` to `hearthstone.zip` and extract it.
2. Copy `hearthstone_BP` into the server's `behavior_packs/` folder.
3. Copy `hearthstone_RP` into the server's `resource_packs/` folder.
4. In `worlds/<your world>/`, create (or add to) these two files:

   `world_behavior_packs.json`
   ```json
   [{ "pack_id": "3e4165a1-baad-4564-a6b2-73a1747ad726", "version": [1, 0, 1] }]
   ```

   `world_resource_packs.json`
   ```json
   [{ "pack_id": "7b2e7f9b-0d2f-4d7b-827a-e92ff37a3f34", "version": [1, 0, 1] }]
   ```
5. Restart the server.

## How to use

1. **Set your home** by sleeping in a bed (or charging a respawn anchor in the Nether).
2. **Hold the Hearthstone** and use it: right-click on PC, long-press on touch screens, or press the left trigger on a controller.
3. **Wait 5 seconds** while the bar fills. Don't take damage, or you'll see *"Hearthstone interrupted: you took damage"* and need to start again.
4. You're teleported home.

### Crafting another Hearthstone

The recipe is shapeless: put the ingredients anywhere in the crafting grid.

| Ingredient | Amount |
| --- | --- |
| Redstone dust | 1 |
| Cobblestone | 1 |
| Lapis lazuli ore (or deepslate lapis ore) | 1 |

> **Tip:** mining lapis ore normally drops lapis lazuli. To get the ore block itself, you need a pickaxe with **Silk Touch**.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| "Unknown dependency" or the pack won't activate | Update Minecraft to 1.21.90 or newer. |
| No Hearthstone when you join | Check that **Hearthstone** is under **Active** in the world's Behavior Packs. Each player only ever gets one free stone. |
| Purple-and-black checkered icon | Turn on **Hearthstone Resources** under the world's Resource Packs. |
| Using the stone does nothing | Make the world a Creator world (world settings, then **Creator**) and turn on **Content Log GUI**. Any script errors will then show on screen. |

## Building from source

On macOS or Linux:

```sh
./build.sh
```

This zips both packs into `hearthstone.mcaddon`.

To regenerate the textures after editing the pixel art in `tools/make_textures.py`:

```sh
python3 tools/make_textures.py "$PWD"
```

When releasing a new version, raise the `version` numbers in both `manifest.json` files so Minecraft replaces the old copy.

## Project layout

```
hearthstone_BP/              Behavior pack
  manifest.json
  items/hearthstone.json     The Hearthstone item
  recipes/                   Crafting recipes
  scripts/main.js            Channeling, interrupts, teleport, starter stone
hearthstone_RP/              Resource pack
  textures/items/hearthstone.png
tools/make_textures.py       Generates the PNG textures
build.sh                     Packages hearthstone.mcaddon
```

To change the channel time, edit `CHANNEL_TICKS` in `scripts/main.js` (20 ticks = 1 second).
