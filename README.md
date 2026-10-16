# Anchorstone (Minecraft Bedrock add-on)

<img src="anchorstone_BP/pack_icon.png" width="96" align="right" alt="Anchorstone icon">

An Anchorstone for Minecraft Bedrock Edition. Use it, stand still for 5 seconds, and you're teleported home. Take any damage or walk away while channeling and the spell is interrupted.

## Features

- **5 second channel:** a progress bar shows on screen while a ring of blue flames spins and rises around you. Halfway through you start to float, the world wobbles, and the screen fades to dark blue just before you're sent home.
- **Damage or walking interrupts:** any damage (mobs, falling, fire, other players) or walking cancels the channel, and all its screen effects stop at once. Looking around is fine. You can start again straight away.
- **Teleports home:** you go to your bed or respawn anchor, even from the Nether or the End. If you haven't set one, you land near world spawn, following the world's `spawnradius` rule, like a normal respawn.
- **Smooth arrival:** your destination is loaded while you channel, so you arrive on solid ground with a burst of blue flames.
- **Free starter stone:** every player gets one Anchorstone the first time they join a world with the add-on turned on. This also works in existing worlds.
- **Reusable:** the stone isn't used up.
- **Craftable:** you can make more at a crafting table.

## Requirements

- Minecraft Bedrock Edition **1.21.90 or newer** (Windows, Xbox, mobile, or Bedrock Dedicated Server).

## Installation (Windows)

1. Download the latest `.mcaddon` from the [Releases](../../releases/latest) page or the [`releases/`](releases) folder, or build it yourself (see [Building from source](#building-from-source)).
2. **Double-click `anchorstone.mcaddon`.** Minecraft opens and shows "Successfully imported" for two packs: *Anchorstone* and *Anchorstone Resources*.
   - If nothing happens, right-click the file, choose **Open with**, and pick **Minecraft**.
3. On the **Play** screen, click the ✏️ pencil icon next to your world, or use **Create New** for a new world.
4. Go to **Behavior Packs**, then **Available**, select **Anchorstone**, and press **Activate**.
5. Accept the prompt to also turn on the resource pack. It's linked, so it switches on automatically.
6. Load the world. You'll get an Anchorstone and a chat message saying "You received an Anchorstone."

### Updating

Double-click the newer `anchorstone.mcaddon`. It replaces the old version. Your world keeps the pack turned on.

> **Upgrading from Hearthstone (1.x):** version 2.0.0 renames the add-on to Anchorstone. Old Hearthstone items disappear from inventories when you update, and every player gets a free Anchorstone the next time they join.

### Bedrock Dedicated Server

1. Rename `anchorstone.mcaddon` to `anchorstone.zip` and extract it.
2. Copy `anchorstone_BP` into the server's `behavior_packs/` folder.
3. Copy `anchorstone_RP` into the server's `resource_packs/` folder.
4. In `worlds/<your world>/`, create (or add to) these two files:

   `world_behavior_packs.json`
   ```json
   [{ "pack_id": "3e4165a1-baad-4564-a6b2-73a1747ad726", "version": [2, 0, 0] }]
   ```

   `world_resource_packs.json`
   ```json
   [{ "pack_id": "7b2e7f9b-0d2f-4d7b-827a-e92ff37a3f34", "version": [2, 0, 0] }]
   ```
5. Restart the server.

## How to use

1. **Set your home** by sleeping in a bed (or charging a respawn anchor in the Nether).
2. **Hold the Anchorstone** and use it: right-click on PC, long-press on touch screens, or press the left trigger on a controller.
3. **Stand still for 5 seconds** while the bar fills. If you take damage or walk, you'll see *"Anchorstone interrupted"* and need to start again.
4. You're teleported home.

### Crafting another Anchorstone

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
| No Anchorstone when you join | Check that **Anchorstone** is under **Active** in the world's Behavior Packs. Each player only ever gets one free stone. |
| Purple-and-black checkered icon | Turn on **Anchorstone Resources** under the world's Resource Packs. |
| Using the stone does nothing | Make the world a Creator world (world settings, then **Creator**) and turn on **Content Log GUI**. Any script errors will then show on screen. |

## Building from source

On macOS or Linux:

```sh
./build.sh
```

This zips both packs into `anchorstone.mcaddon`.

To regenerate the item texture after editing the pixel art in `tools/make_textures.py` (the pack icons are drawn separately):

```sh
python3 tools/make_textures.py "$PWD"
```

When releasing a new version, raise the `version` numbers in both `manifest.json` files so Minecraft replaces the old copy, then copy the built file into `releases/` as `anchorstone-<version>.mcaddon`. Add an entry to [`CHANGELOG.md`](CHANGELOG.md) at the same time.

### CurseForge listing

The text and art for the CurseForge project page live in [`curseforge/`](curseforge):

- `description.md`: the project description (CurseForge's editor accepts Markdown).
- `logo.png`: the 512×512 project logo.

For each file you upload to CurseForge, use that version's entry from [`CHANGELOG.md`](CHANGELOG.md) as the changelog.

## Project layout

```
anchorstone_BP/              Behavior pack
  manifest.json
  items/anchorstone.json     The Anchorstone item
  recipes/                   Crafting recipes
  scripts/main.js            Channeling, effects, interrupts, teleport, starter stone
anchorstone_RP/              Resource pack
  textures/items/anchorstone.png
tools/make_textures.py       Generates the item texture
curseforge/                  CurseForge description and logo
releases/                    Built .mcaddon files for each version
build.sh                     Packages anchorstone.mcaddon
CHANGELOG.md                 What changed in each version
```

To change the channel time, edit `CHANNEL_TICKS` in `scripts/main.js` (20 ticks = 1 second).

## License

[MIT](LICENSE) © 2026 Levi Putna
