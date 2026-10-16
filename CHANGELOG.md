# Changelog

All notable changes to Anchorstone are listed here. Versions match the `version` in both `manifest.json` files.

## [2.0.0] - 2026-10-16

### Changed
- Renamed from Hearthstone to **Anchorstone**: the item, both packs, and all in-game text.
- The item ID is now `anchorstone:anchorstone`. Old Hearthstone items disappear when you update, and every player gets a free Anchorstone the next time they join.
- Released under the MIT licence.

## [1.1.1] - 2026-10-16

### Changed
- New item texture to match the new pack icon art: a grey stone ring with gold studs around a blue swirl.

## [1.1.0] - 2026-10-16

### Added
- A ring of blue flames spins and rises all the way around you while you channel.
- From 2 seconds in, you slowly float up half a block, right up to the teleport.
- At 3 seconds the screen wobbles and a portal hum builds. At 4.5 seconds a burst of blue flames goes off and the screen fades to dark blue.
- A burst of blue flames and a chime when you arrive home.
- Your destination is loaded while you channel, so you arrive on solid ground.
- New pack icons.

### Changed
- Walking now interrupts the channel, as well as taking damage. Looking around is fine.
- Interrupting the channel stops the fade, wobble and sound straight away.
- Without a bed or respawn anchor, you land on dry ground near world spawn, following the world's `spawnradius` rule, like a normal respawn.

## [1.0.1] - 2026-10-13

### Added
- First release as Hearthstone: use the stone, channel for 5 seconds, and teleport to your bed, respawn anchor or world spawn.
- Taking damage interrupts the channel.
- Every player gets one free stone the first time they join.
- Shapeless crafting recipe: redstone, cobblestone and lapis lazuli ore (or deepslate lapis ore).
