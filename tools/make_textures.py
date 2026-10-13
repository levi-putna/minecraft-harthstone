"""Generates the Hearthstone item texture and pack icons as PNGs (no dependencies)."""
import struct, zlib, sys

def png(path, pixels, scale=1):
    h = len(pixels) * scale
    w = len(pixels[0]) * scale
    raw = b""
    for row in pixels:
        line = b"\x00" + b"".join(bytes(px) * scale for px in row)
        raw += line * scale
    def chunk(t, d):
        return struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xFFFFFFFF)
    data = (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0))
            + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b""))
    open(path, "wb").write(data)

# Rounded grey stone with a glowing blue rune, in the spirit of the WoW hearthstone.
art = [
    "................",
    ".....######.....",
    "...##aaaaaa##...",
    "..#aabbbbbbaa#..",
    "..#abbbbbbbbba#.",
    ".#abbbbccbbbbb#.",
    ".#abbbcddcbbbb#.",
    ".#abbcdeedcbbb#.",
    ".#abbcdeedcbbb#.",
    ".#abbbcddcbbbs#.",
    ".#abbbbccbbbss#.",
    "..#abbbbbbbss#..",
    "..#sbbbbbbsss#..",
    "...##sssssss##..",
    ".....######.....",
    "................",
]
pal = {
    ".": (0, 0, 0, 0), "#": (40, 40, 48, 255), "a": (150, 150, 160, 255),
    "b": (110, 110, 122, 255), "s": (78, 78, 90, 255), "c": (40, 110, 200, 255),
    "d": (80, 170, 255, 255), "e": (200, 240, 255, 255),
}
px = [[pal[c] for c in row] for row in art]
out = sys.argv[1]
png(f"{out}/hearthstone_RP/textures/items/hearthstone.png", px)
png(f"{out}/hearthstone_RP/pack_icon.png", px, scale=8)
png(f"{out}/hearthstone_BP/pack_icon.png", px, scale=8)
