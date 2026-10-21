#!/usr/bin/env bash
# Writes WebP copies 400, 800, 1200 and 1600 px wide next to every photo in public/images, for srcset
# (see src/lib/images.ts). Needs cwebp (brew install webp). Safe to re-run.
set -euo pipefail
cd "$(dirname "$0")/../public/images"

find . -name '*.jpg' ! -name '*-poster.jpg' ! -name 'panorama-360.jpg' | sort | while read -r photo; do
  base="${photo%.jpg}"
  for width in 400 800 1200 1600; do
    [ "$photo" -nt "$base-$width.webp" ] || [ ! -f "$base-$width.webp" ] || continue
    cwebp -quiet -q 72 -resize "$width" 0 -metadata none "$photo" -o "$base-$width.webp"
  done
  echo "$photo"
done
