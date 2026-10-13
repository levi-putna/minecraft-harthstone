# Hearthstone (Minecraft Bedrock add-on)

Use the Hearthstone and channel for 5 seconds to teleport to your bed or respawn anchor (or world spawn if you don't have one). Taking any damage interrupts the channel.

- Every player gets one Hearthstone the first time they join with the add-on active.
- Recipe (shapeless): 1 redstone + 1 cobblestone + 1 lapis lazuli ore (deepslate lapis ore also works).
- Requires Minecraft Bedrock 1.21.90 or newer.

## Build

```sh
./build.sh
```

This produces `hearthstone.mcaddon`. Double-click it on Windows to import, then activate the **Hearthstone** behavior pack in your world's settings.

## Layout

- `hearthstone_BP/` – behavior pack: item, recipes, and `scripts/main.js` (channel, interrupt, teleport, starter stone)
- `hearthstone_RP/` – resource pack: item texture and pack icon
- `tools/make_textures.py` – regenerates the PNG textures
