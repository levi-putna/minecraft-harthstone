"""Generates the Hearthstone item texture as a PNG (no dependencies)."""
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

# Grey octagonal stone with four gold studs around a glowing blue swirl,
# matching the pack icons (which are drawn separately at 128x128).
art = [
    ".......Gg.......",
    ".....##Gg##.....",
    "....#LLmmmm#....",
    "...#LL####mm#...",
    "..#LL#DDDD#mm#..",
    ".#LL#DCCCCD#ms#.",
    ".#L#DCBBBBWD#s#.",
    "GGm#DCBWWBCD#sgg",
    "ggm#DCBBWBCD#sgg",
    ".#m#DBCBBCCD#s#.",
    ".#mm#DBCCCD#ss#.",
    "..#mm#DDDD#ss#..",
    "...#mm####ss#...",
    "....#ssssss#....",
    ".....##gg##.....",
    ".......gg.......",
]
pal = {
    ".": (0, 0, 0, 0), "#": (38, 38, 48, 255),
    "L": (196, 196, 206, 255), "m": (140, 140, 154, 255), "s": (92, 92, 106, 255),
    "G": (236, 178, 64, 255), "g": (176, 116, 40, 255),
    "D": (18, 46, 160, 255), "B": (36, 104, 226, 255), "C": (90, 190, 255, 255), "W": (214, 244, 255, 255),
}
px = [[pal[c] for c in row] for row in art]
out = sys.argv[1]
png(f"{out}/hearthstone_RP/textures/items/hearthstone.png", px)
