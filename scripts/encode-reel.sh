#!/usr/bin/env bash
# Encode a reel for the site: H.264 MP4 + 8-bit VP9 WebM fallback + JPEG poster.
#
#   scripts/encode-reel.sh <source> <out-basename> [end-seconds] [poster-seconds]
#
#   source          original video (any format ffmpeg reads: .mov, .mp4, HEVC, ...)
#   out-basename    e.g. media/reels-ready/merchant-tavern-bar  (extensions are added)
#   end-seconds     optional: cut the clip here — use it to drop fade-outs / logo end
#                   cards, which flash black every time an autoplay loop restarts
#   poster-seconds  optional: frame to use as the still (default 1.0)
#
# Why these settings:
#   - H.264, 8-bit: plays in every browser. Phone footage is often HEVC, which
#     Chrome and Firefox largely refuse to play.
#   - <=720px wide: the reel slot is 320px (640 device px on retina), so more is wasted.
#   - No audio: autoplay only works muted, so it's dead weight.
#   - +faststart: playback begins before the whole file arrives.
#   - VP9 forced to 8-bit (yuv420p): 10-bit sources otherwise produce VP9 Profile 2,
#     which many of the very browsers that need the fallback can't decode.
#
# Set FFMPEG=/path/to/ffmpeg if ffmpeg isn't on your PATH.
set -euo pipefail
FF="${FFMPEG:-ffmpeg}"
src="$1"; out="$2"; end="${3:-}"; poster="${4:-1.0}"
[ -f "$src" ] || { echo "no such file: $src" >&2; exit 1; }
mkdir -p "$(dirname "$out")"
trim=(); [ -n "$end" ] && trim=(-t "$end")
scale="scale='min(720,iw)':-2"

"$FF" -hide_banner -loglevel error -y -i "$src" "${trim[@]}" \
  -c:v libx264 -profile:v main -pix_fmt yuv420p -crf 28 -preset slow \
  -vf "$scale" -an -movflags +faststart "$out.mp4"

"$FF" -hide_banner -loglevel error -y -i "$src" "${trim[@]}" \
  -c:v libvpx-vp9 -pix_fmt yuv420p -crf 40 -b:v 0 -row-mt 1 -deadline good -cpu-used 2 \
  -vf "scale='min(640,iw)':-2" -an "$out.webm"

"$FF" -hide_banner -loglevel error -y -ss "$poster" -i "$src" -frames:v 1 \
  -vf "$scale" -q:v 3 "$out.jpg"

for ext in mp4 webm jpg; do
  printf '  %-48s %6d KB\n' "$out.$ext" $(( $(wc -c < "$out.$ext") / 1024 ))
done
