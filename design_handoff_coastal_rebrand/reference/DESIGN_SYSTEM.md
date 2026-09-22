# Moments Creative — Design System

Moments Creative is a small marketing agency in Newfoundland & Labrador that makes
content for local small businesses — photos, video, reels, and the posting schedule
around them. Clients are restaurants, bars, and neighbourhood service businesses
(The Merchant Tavern, Adelaide Oyster House, Grotto). The pitch is explicitly about taking work off the owner's plate:
*"so your business shows up online without eating into your day."*

## Sources

Everything here was read from one repository — no Figma file, no screenshots,
no other codebase was provided.

- **GitHub:** <https://github.com/Jwheels/Moments-Creative> — branch
  `claude/moments-creative-site-tt4bgi`. Read: `README.md`, `public/index.html`,
  `public/css/styles.css`, `public/js/main.js`; imported `public/img/work/*`.
- **Live site:** <https://momentscreative.ca>

The repo's own README names the look **"Tide & Table"** and gives a seven-colour
token table; those hexes are the source of truth for the palette here. Explore
the repository further — the stylesheet is short, unminified and heavily
commented, and it will tell you more than any summary can.

### Products represented

**One**: the marketing site at momentscreative.ca. A single-page Cloudflare Worker
serving static HTML/CSS/JS, plus an inquiry endpoint that emails submissions. There
is no app, no dashboard, no docs site, and no slide template — so this system ships
one UI kit and no sample slides.

---

## Content fundamentals

The voice is a **capable neighbour**, not an agency. Plain, warm, second-person,
slightly under-sold.

- **"You" and "we", never "I".** "We check the numbers that matter to you."
  The reader's business is always "your place", "your space", "your team".
- **Sentence case everywhere.** Headings, eyebrows, buttons, labels. No Title Case,
  no ALL CAPS, no letter-spaced small caps.
- **Headlines are full sentences with a period**, and they're long: *"Turn what's
  already great about your business into content people can't scroll past."*
  Section headings are short noun phrases instead: *"Content with a job to do"*,
  *"Frequently asked questions"*, *"How we'll help you"*.
- **Contractions always** — "you've got", "what's working", "let's talk".
- **Em dashes do the heavy lifting.** Nearly every paragraph has one, used for the
  aside that makes the claim honest: *"against real numbers — not just likes"*.
- **Concedes before it sells.** Copy repeatedly acknowledges the reader's position:
  "Running a small business already takes everything you've got", "That's normal",
  "No. We can start from nothing."
- **FAQ questions are written in the client's own words**, first person:
  *"What if I'm not sure what I actually need?"* Answers open bluntly — "No.",
  "Not at all —", "It depends on the package, but…" — and run 1–2 sentences.
- **No hype vocabulary.** No "unlock", "elevate", "transform", "ROI", "synergy",
  "world-class". The strongest word on the page is "consistent".
- **Numbers are avoided.** There are no stats, no "500+ clients", no pricing. Claims
  are qualitative and hedged honestly: "takes a little time to build momentum".
- **Buttons are verb phrases, 2–3 words:** "Start a project", "See the work",
  "Send inquiry", "Get in touch".
- **Form copy is conversational.** Labels: "Your name", "Phone (optional)",
  "Anything else we should know?" Placeholders are examples, not instructions:
  "(709) 000-0000", "Your restaurant or business". The select's first option is
  *"Not sure yet — let's talk"* — the brand's whole posture in five words.
- **Errors always give a way out:** "Something went wrong sending that. Please email
  hello@momentscreative.ca directly." Success is short and human: "Thanks — we'll
  be in touch soon."
- **Captions are the client name only** — "The Merchant Tavern", "Grotto",
  "Adelaide Oyster House". No format prefix, no punctuation. The middle dot `·` still
  separates the footer line.
- **No emoji.** Anywhere. (The repo README uses one ⚠️ in deployment instructions;
  nothing visitor-facing does.)

---

## Visual foundations

**Warm, clean, quiet.** Cream paper, ink, one slate-blue accent, one sun-yellow
rule, and photography doing the emotional work. Reads closer to a letterpress menu
than a SaaS landing page.

**Colour — "Coastal" (chosen Sept 2026).** Cream `#FAF6EC` page, ink `#1F2B3A`
for text, slate blue `#2E4A6B` for every button, link, accent rule and the dark band,
sun yellow `#F4D35E` for the logo brackets, underlines and dark-band rules. Fog
`#C9D3DD` is secondary text on slate; `#4F5B69` / `#7C8794` are the secondary and
muted ink; `#E3E1D8` hairlines. Exactly **two background colours** in page layouts:
cream and one slate band (sun yellow is allowed as a ground for the logo and small
social/print pieces). **Never set yellow text on cream** — it fails contrast; yellow
is for marks, rules and fills only. Error brick `#B23A2E` is the only extra hue;
success reuses slate. (This replaces the site's original "Tide & Table" teal/mustard.)

**Type.** **Outfit** for the logo and every heading — weight 600, tracking −0.02em,
1.15 leading, upright (never italic). It matches the logo's round geometry, so the
page and the mark speak one voice. **Work Sans** 400/500/600 for everything else.
Sizes: 48px hero (34px mobile), 34px and 32px band headings, 21px h3, 17px Work Sans
h3 on the dark band, 18px lead, 15px body, 14px small, 13px labels, 12px captions.
Body leading 1.6; the lead paragraph is measured at 54ch. One deliberate face swap:
service-card titles are Outfit, but dark-band item titles are Work Sans semibold —
Outfit is reserved for the band's own heading. (Replaces the original site's italic
Newsreader headings, Sept 2026.)

**Spacing & layout.** 1080px content width, 32px gutter on every band; narrower
measures nest inside (760px prose, 700px FAQ, 640px form). Vertical band padding is
generous and asymmetric — `46px 32px 70px` on the work strip, `80px 32px 100px` on the
inquiry section — while horizontal gaps are tight: 14px between media cards, 16px
between form fields, 40px between text columns. Nothing is fixed or sticky; the nav
scrolls away. `scroll-behavior: smooth` on `html` is the only scroll treatment.

**Backgrounds.** Flat colour only. **No gradients** except one: the caption scrim,
`linear-gradient(transparent, rgba(0,0,0,.68))`. No textures, patterns, noise, grain
overlays, or hand-drawn illustration. There are no full-bleed photo bands.

**Cards, borders, shadows.** There are **zero box-shadows in the entire stylesheet** —
no elevation system, inner or outer. "Cards" are not boxes: a service card is a 2px
teal top rule and type, nothing else. Dark-band items use the same construction with
a mustard rule. FAQ rows and the footer are separated by 1px hairlines. Media frames
are the only filled containers, and they're filled by a photograph.

**Radii.** 2px on buttons (nearly square, deliberately), 4px on form fields, 6px on
media frames, 0 on rules. No pills, no circles.

**Transparency & blur.** None — no glass, no backdrop-filter, no translucent panels.
The two alpha values in the system are the caption scrim (68% black) and 0.6 opacity
on a disabled button.

**Protection.** Cream caption text sits on the gradient scrim, never a capsule or
solid chip. The scrim needs its generous top padding (34px) to fade in properly.

**Animation.** Essentially none. No keyframes, no transitions, no reveal-on-scroll,
no bounce, no easing curves to document. The only motion on the page is the autoplaying
muted 9:16 reel, and `main.js` pauses it and exposes controls under
`prefers-reduced-motion: reduce`. If you add motion, keep it to that budget.

**Hover & press states.** The source stylesheet defines **no `:hover` or `:active`
rules at all** — buttons and links keep their colour under the cursor. Focus changes
only the field border to teal (`outline: none` plus `border-color`), with no ring and
no shadow. Disabled is 0.6 opacity plus a label change to "Sending...". This system
preserves that restraint; if a hover state is genuinely needed, ask before inventing
one, and go no further than a slight darkening of teal.

**Imagery.** Real available-light photography of food, drinks, rooms, signage and
teams — warm-toned, shot close, shallow depth of field, no filter or duotone, no
black and white, no stock. Grid cards are 4:5 portrait at 900×1125; the reel is 9:16
at 720 wide, H.264, audio stripped. Everything
is `object-fit: cover` centre-cropped, so landscape shots dropped into a 4:5 slot cut
heads off — export to ratio.

---

## Iconography

**There is no icon system.** No icon font, no SVG sprite, no Lucide/Heroicons/Feather
dependency, no PNG icons, and no emoji in any visitor-facing surface. Nothing was
substituted from a CDN, because substituting would have invented a vocabulary the
brand doesn't have.

Where a UI normally reaches for a glyph, this brand uses a **typographic mark from
the running typeface**:

- FAQ disclosure: `+` when closed, an en dash `–` when open (`content: '\2013'`),
  20px, teal.
- Separators: the middle dot `·` in captions and the footer line.
- No chevrons, arrows, social icons, checkmarks or spinners exist. The submit button's
  loading state is the word "Sending...", not a spinner.

**Logo (final artwork, Sept 2026).** Lowercase "moments" in Outfit 600 with
**CREATIVE** letterspaced underneath, framed by two thin, round-ended viewfinder
brackets (top-left and bottom-right). Outlined vector files in `assets/logo/`:
`moments-creative-logo.svg` (ink + sun, primary), `-cream.svg` (for dark grounds),
`-reversed.svg` (on slate), `-slate.svg` (one colour), `-on-sun.svg`, `-black.svg`.
Brackets are sun yellow on cream and slate; on sun yellow everything goes slate. In
React use the `Wordmark` component, which inlines the same paths. Never retype the
logo in live text.

**Monogram.** A single lowercase "m" in the same brackets, for favicons, social
avatars and watermarks: `assets/logo/moments-creative-mark*.svg` (ink, cream, slate,
black, avatar on a slate square) and `assets/logo/favicon.svg` (rounded slate
square). In React use `Monogram` (exported from `components/core/Wordmark.jsx`).

Imported assets: the six production photographs in `assets/work/`.

---

## Fonts

Outfit (logo + headings) and Work Sans (body) are Google Fonts, loaded via `@import`
in `tokens/fonts.css`. No binaries are shipped, so there are no local `@font-face`
rules. Send licensed files if you'd rather self-host.

---

## Index

| Path | What it is |
| --- | --- |
| `styles.css` | The one stylesheet consumers link. `@import` list only. |
| `tokens/colors.css` | Palette + semantic aliases. |
| `tokens/typography.css` | Font stacks, size scale, leading, measure. |
| `tokens/spacing.css` | Spacing scale, gutters, grid gaps, content widths. |
| `tokens/shape.css` | Radii, border/rule weights, media ratios, state values. |
| `tokens/fonts.css` | Google Fonts import for Outfit + Work Sans. |
| `tokens/base.css` | Body, heading and link resets. |
| `guidelines/*.html` | 18 foundation specimen cards (Colors, Type, Spacing, Brand). |
| `assets/work/` | Six production photographs. |
| `ui_kits/website/` | Recreation of momentscreative.ca — see its README. |
| `templates/landing-page/` | Landing-page template consuming projects can start from. |
| `explorations/` | Logo & colour exploration canvas. |
| `thumbnail.html` | Homepage tile. |
| `github.md` | Source-repo association and screen map for upstream sync. |
| `SKILL.md` | Agent-skill entry point. |

### Components

Every family below exists in the source stylesheet; nothing was added that the site
doesn't have.

**`components/core/`** — `Button` (primary / ghost / nav), `Wordmark` (the logo lockup), `Monogram`,
`SectionHeading`, `SectionLabel`
**`components/media/`** — `WorkCard`, `ReelFrame`, `Caption`
**`components/content/`** — `ServiceCard`, `HelpItem`, `FaqItem`
**`components/forms/`** — `Field`, `TextInput`, `Select`, `Textarea`, `FormStatus`
**`components/layout/`** — `NavBar`, `DarkBand`, `SiteFooter`

*Intentional additions:* `Caption` and `SectionHeading` are extractions, not
inventions — the stylesheet defines `.cap` on three different media frames and italic
serif headings at four sizes, so each is factored once rather than repeated. No
Toast, Avatar, Tabs, Tooltip, Badge, Modal or Switch is provided, because the site
has none; adding them would invent a vocabulary designers wouldn't recognise.

### UI kits

- **`ui_kits/website/`** — momentscreative.ca: nav, hero, four-up work grid, services,
  vertical reel, slate benefits band, FAQ, inquiry form with
  a working submit and success state, footer.

### Templates

- **`templates/landing-page/LandingPage.dc.html`** — the same page as an editable
  starting point, with a toggle for the reel.
