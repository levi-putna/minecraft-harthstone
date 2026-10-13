#!/bin/sh
# Packages both packs into hearthstone.mcaddon (double-click it on Windows to install).
set -e
cd "$(dirname "$0")"
rm -f hearthstone.mcaddon
zip -rq hearthstone.mcaddon hearthstone_BP hearthstone_RP -x '*.DS_Store'
echo "Built hearthstone.mcaddon"
