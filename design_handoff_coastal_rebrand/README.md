# Handoff: Moments Creative "Coastal" rebrand

## Overview
Rebrand the live site at momentscreative.ca (repo `Jwheels/Moments-Creative`,
branch `claude/moments-creative-site-tt4bgi`). There are four changes:
1. New palette ("Coastal"): slate blue, sun yellow, cream, fog, cool ink.
2. Headings move from italic Newsreader to upright **Outfit 600**.
3. The text wordmark in the nav and footer is replaced by the **final SVG logo**.
4. Add a **favicon**, using the "m" monogram.

The page's structure, copy, sections, spacing, radii and behaviour **do not change**.
This is a reskin of `public/index.html` and `public/css/styles.css`.

## About the design files
The files under `reference/` are **design references built in HTML/React**. They
show the intended look; they are not code to ship. The production site is plain
static HTML + CSS + one JS file, with no framework. Apply the changes below to that
existing code. Don't port the React components.

The SVGs in `assets/logo/` **are** production-ready. Ship them as they are.

## Fidelity
**High-fidelity.** The hex values, font settings and logo artwork below are final.

---

## 1. Assets to add to the repo
Copy these into `public/img/`:

| File | Use |
| --- | --- |
| `assets/logo/moments-creative-logo.svg` | Nav + footer logo (ink letters, sun brackets, transparent). |
| `assets/logo/favicon.svg` | `<link rel="icon">` (cream m on rounded slate square). |
| `assets/logo/moments-creative-logo-cream.svg` | Optional, for any future dark-ground placement. |
| `assets/logo/moments-creative-mark-avatar.svg` | Social profile pictures (not used on the site). |

Also present (not needed for the site): `-reversed`, `-slate`, `-on-sun`, `-black`
lockups, plus `-mark`, `-mark-cream`, `-mark-slate`, `-mark-black` monograms.

Logo viewBox is `0 0 970.6 365` (aspect ≈ 2.66:1).

## 2. `public/index.html`

**Fonts.** Replace the Google Fonts `<link>` with:
```html
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Work+Sans:wght@400;500;600&display=swap" rel="stylesheet">
```
Newsreader is no longer used anywhere.

**Favicon.** Add this in `<head>`:
```html
<link rel="icon" type="image/svg+xml" href="/img/favicon.svg">
```

**Nav logo.** Where the `<!-- LOGO SWAP -->` comment is, replace
`<div class="word">Moments Creative</div>` with:
```html
<a href="/" class="logo-link"><img class="logo" src="/img/moments-creative-logo.svg" alt="Moments Creative" width="170" height="64"></a>
```

**Footer logo.** Same swap, in the footer:
```html
<img class="logo logo-footer" src="/img/moments-creative-logo.svg" alt="Moments Creative" width="140" height="53">
```

Leave everything else in the HTML untouched.

## 3. `public/css/styles.css` — exact changes

### Colour find/replace (whole file)
| Old | New | Role |
| --- | --- | --- |
| `#F7F2E7` | `#FAF6EC` | cream: page bg, text on dark |
| `#2B2622` | `#1F2B3A` | ink: body text, labels, field text |
| `#0F5257` | `#2E4A6B` | slate: buttons, nav pill, links, service rule, focus border, FAQ +, success text |
| `#D4A017` | `#F4D35E` | sun: ghost-button underline, help-item rule |
| `#5A5248` | `#4F5B69` | ink-2: secondary text |
| `#C9BDA6` | `#C9D3DD` | fog: body copy on dark band |
| `#8A806E` | `#7C8794` | ink-3: footer line |
| `#E4DAC5` | `#E3E1D8` | hairline: FAQ + footer rules |
| `#DCD2BF` | `#D6D6CE` | field border |
| `#FFFDF9` | `#FFFDF7` | field bg |

`#B23A2E` (error) and `rgba(0,0,0,.68)` (caption scrim) are **unchanged**.

### Dark band becomes slate
```css
.help-band { background: #2E4A6B; }       /* was #2B2622 */
.reel-frame { background: #2E4A6B; }      /* placeholder behind video */
```

### Headings → Outfit
```css
h1, h2, h3 { font-family: 'Outfit', sans-serif; font-weight: 600; letter-spacing: -0.02em; }
```
Then **remove every `font-style: italic`** from `.hero h1`, `.services h2`,
`.help-inner h2`, `.inquiry h2` and `.faq h2`. Headings are never italic.
Change `.hero h1` line-height `1.2` → `1.15`.
`.service-card h3` gets `letter-spacing: -0.01em`.
`.help-item h3` stays Work Sans 600, 17px (that face swap is intentional).

All font **sizes** stay the same: 48 / 34 / 32 / 21 / 17px headings (34px hero
under 720px).

### Logo
Delete the `nav .word` and `footer .word` rules and add:
```css
nav .logo { height: 62px; width: auto; display: block; }
footer .logo { height: 51px; width: auto; display: block; margin: 0 auto 10px; }
.logo-link { display: block; line-height: 0; }
@media (max-width: 720px) { nav .logo { height: 50px; } }
```
(The heights are the "moments" letter size × 1.825: 34px nav, 28px footer.)

### Unchanged
Layout, padding, gaps, widths (1080 / 760 / 700 / 640), radii (2px buttons, 4px
fields, 6px media), 2px accent rules, 1px hairlines, no shadows, no hover rules,
caption scrim, the reduced-motion handling in `main.js`, the form's behaviour and
copy.

---

## Design tokens (reference)
Colours: slate `#2E4A6B` · sun `#F4D35E` · cream `#FAF6EC` · fog `#C9D3DD` ·
ink `#1F2B3A` · ink-2 `#4F5B69` · ink-3 `#7C8794` · hairline `#E3E1D8` ·
field-border `#D6D6CE` · field-bg `#FFFDF7` · error `#B23A2E`.

Type: Outfit 600, −0.02em, 1.15 leading for headings. Work Sans 400/500/600,
1.6 leading for body. Sizes are 48/34/32/21/18/17/16/15/14/13/12px.

Rules: **never set sun-yellow text on cream** (it fails contrast). Yellow is only for
logo brackets, rules, underlines and fills.

Full token list: `reference/tokens/*.css`. Full brand guide: `reference/DESIGN_SYSTEM.md`.

## Files in this bundle
- `assets/logo/`: production SVGs (logo lockups, monograms, favicon).
- `reference/styles.css` + `reference/tokens/`: the design system's CSS variables.
- `reference/DESIGN_SYSTEM.md`: voice, visual foundations, iconography, logo usage.

## Suggested Claude Code prompt
> Read `design_handoff_coastal_rebrand/README.md`. Copy the listed SVGs into
> `public/img/`, then apply sections 2 and 3 to `public/index.html` and
> `public/css/styles.css` exactly. Don't change layout, copy or JS. Run the
> site locally and confirm there's no italic heading, no Newsreader request, and
> no old hex value left in `styles.css`.
