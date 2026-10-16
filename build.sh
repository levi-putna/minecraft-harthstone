#!/bin/sh
# Packages both packs into anchorstone.mcaddon (double-click it on Windows to install).
set -e
cd "$(dirname "$0")"
rm -f anchorstone.mcaddon
zip -rq anchorstone.mcaddon anchorstone_BP anchorstone_RP -x '*.DS_Store'
echo "Built anchorstone.mcaddon"
