# Media library

Nothing in this folder is deployed. The site only serves `public/` (see
`assets.directory` in `wrangler.jsonc`), so files here are private until they're
moved or copied into `public/`.

```
media/
  originals/reels/   Full-quality source files. Re-encode from these, never from
                     the web versions.
  reels-ready/       Encoded for the site and ready to use, but NOT live yet.
```

## Reels ready to use

Each has an `.mp4` (H.264, what nearly every browser plays), a `.webm` (8-bit VP9
fallback) and a `.jpg` poster. All are 720x1280 vertical, silent, 30 fps.

| Reel | Client | Source | Cut | Length | MP4 | Poster frame |
| --- | --- | --- | --- | --- | --- | --- |
| `adelaide-new-menu` | Adelaide Oyster House | `adelaide-new-menu.mov` | ends 16.0s — drops fade to black | 16.0s | 2.8 MB | 13.4s — cheers over the spread |
| `merchant-tavern-vibe` | The Merchant Tavern | `merchant-tavern-vibe.mov` | ends 13.3s — drops fade to black | 13.3s | 2.3 MB | 10.9s — crab and white wine |
| `merchant-tavern-bar` | The Merchant Tavern | `merchant-tavern-bar.mov` | ends 12.0s — drops fade + logo end card | 12.0s | 1.6 MB | 8.4s — pink foam cocktail |

Fades and end cards are cut because the site plays reels as silent autoplay
loops: anything that goes to black flashes a black screen every time the loop
restarts. Quality against the originals (SSIM, 1.0 = identical): 0.975, 0.978,
0.980 — slightly above the live Adelaide patio reel (0.969).

Already live: `adelaide-patio` (source in `originals/reels/adelaide-patio.mp4`,
web files in `public/img/work/`).

## Putting one on the site

1. Move its three files into `public/img/work/`:
   ```sh
   git mv media/reels-ready/merchant-tavern-bar.* public/img/work/
   ```
2. Add it to `public/index.html`, same markup as the live reel:
   ```html
   <div class="reel-frame">
     <video class="fill" poster="/img/work/merchant-tavern-bar.jpg"
            width="720" height="1280" muted loop playsinline autoplay preload="metadata"
            data-autoplay aria-label="Reel of a cocktail being made at The Merchant Tavern">
       <source src="/img/work/merchant-tavern-bar.mp4" type="video/mp4">
       <source src="/img/work/merchant-tavern-bar.webm" type="video/webm">
     </video>
     <div class="cap">The Merchant Tavern</div>
   </div>
   ```
   `data-autoplay` is what lets `main.js` pause it for visitors who have
   reduced motion turned on — keep it.

**Before putting several reels on one page:** these are 1.6–2.8 MB each, and
autoplaying video starts downloading as soon as the page loads, whether or not
it's on screen. Two or three more would roughly triple the page's weight. At that
point reels should only start loading once scrolled into view — a small addition
to `main.js`.

## Adding a new reel

1. Export from QuickTime at 720p (leave "Use HEVC" unticked) or use HandBrake's
   "Social 25 MB" presets, to get under GitHub's 25 MB upload limit.
2. Upload it to the repo root, or `media/originals/reels/` — never `public/`.
3. Encode:
   ```sh
   scripts/encode-reel.sh media/originals/reels/<name>.mov media/reels-ready/<name> [end-seconds] [poster-seconds]
   ```
   Check the ending first; if it fades out or has an end card, pass the second
   the fade begins as `end-seconds`.
