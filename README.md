# Moments Creative

Landing page for [momentscreative.ca](https://momentscreative.ca). A Cloudflare
**Worker with static assets**: the page is plain HTML/CSS/JS served from the
edge, plus one small Worker script that emails inquiry form submissions to
`hello@momentscreative.ca`.

```
public/                 Everything served to visitors
  index.html              The landing page (markup + copy only)
  css/styles.css          All styling — the Tide & Table design system
  js/main.js              Inquiry form submission handling
  _headers                Security headers
src/
  index.js                Worker entry point — routes /api/inquiry
  inquiry.js              Validates submissions and sends the email
wrangler.jsonc          Cloudflare configuration
```

Requests are matched against `public/` first. Anything with no matching file
falls through to `src/index.js`, which is how `/api/inquiry` reaches the Worker
while every real page and asset is served straight from the edge. Nothing
outside `public/` is ever served, so the Worker source, config, and this README
stay private.

> **A note on Pages vs Workers.** This started out using Cloudflare Pages'
> `functions/` convention, where a file at `functions/api/inquiry.js` becomes an
> endpoint automatically. That is a **Pages-only feature**. The project was
> deployed as a Worker, which ignores `functions/` and uploaded it as a plain
> static file — so `/api/inquiry` returned 404 and the form silently failed.
> Cloudflare now recommends Workers over Pages for new projects, so the fix was
> to add a real Worker entry point rather than move back to Pages.

## Design system

Don't invent new values; reuse these.

| Token | Value | Used for |
| --- | --- | --- |
| Cream | `#F7F2E7` | Page background |
| Charcoal | `#2B2622` | Body text, dark band, placeholder card |
| Teal | `#0F5257` | Buttons, links, accent rules |
| Mustard | `#D4A017` | Underlines, accent rules, placeholder card |
| Warm grey | `#5A5248` | Secondary body copy |
| Sand | `#C9BDA6` | Muted text on dark, placeholder card |
| Hairline | `#E4DAC5` | Borders and dividers |

Type: **Newsreader** (serif, italic for all headings) and **Work Sans** (UI and
body), both from Google Fonts. Headings are italic serif — that's the signature of
the look, so keep it.

---

## Deploying

The GitHub repo is connected to Cloudflare, so **every push to the production
branch deploys automatically**. There is no manual upload step and no zip to
drag anywhere. Push, wait a minute, done.

Watch a build in Cloudflare → **Workers & Pages** → **moments-creative** →
**Deployments**. A failed build leaves the previous deployment serving, so a bad
push degrades to "nothing changed" rather than downtime.

To deploy by hand from a checkout instead:

```sh
npx wrangler deploy
```

### Connecting momentscreative.ca

Already done, but for reference — since the domain is in the same Cloudflare
account this is confirmation clicks, not registrar or nameserver edits:

1. Worker → **Settings** → **Domains & Routes** → **Add** → **Custom domain**
2. Enter `momentscreative.ca`. Cloudflare recognises the domain, shows the DNS
   record it will create, and asks you to confirm.
3. Repeat for `www.momentscreative.ca`. Add both — visitors type both.
4. SSL is issued automatically; allow up to ~15 minutes.

To keep `www` from splitting your SEO, redirect it to the apex. **Rules** →
**Redirect Rules** → **Create**: if hostname equals `www.momentscreative.ca`,
then dynamic redirect, **301**, expression
`concat("https://momentscreative.ca", http.request.uri.path)`.

The site's `<link rel="canonical">` points at the apex. If you'd rather `www` be
canonical, flip the rule and update the `canonical` and `og:url` tags in
`public/index.html` to match.

## The inquiry form and Resend

The form posts JSON to `/api/inquiry`. That Function emails the inquiry inbox through
[Resend](https://resend.com) — a transactional email API. **Until you finish this
section the form will show visitors a polite error** pointing them at
`hello@momentscreative.ca`, rather than failing silently.

### Why not just SMTP to the Google Workspace inbox?

Cloudflare's serverless runtime can't open raw SMTP connections, so a Function
can't talk to Gmail's servers directly. It has to call an email API over HTTPS.
Resend's free tier is 3,000 emails/month — an inquiry form will never approach
that. The Google Workspace inbox stays exactly where it is; Resend only does the sending.

### What this depends on

- A Resend account (free).
- **Three DNS records** on `momentscreative.ca`, added in Cloudflare.
- **One secret**, `RESEND_API_KEY`, in the Secrets Store and bound in
  `wrangler.jsonc`.

### Steps

1. **Sign up** at [resend.com](https://resend.com).

2. **Add the domain.** Resend → **Domains** → **Add Domain** →
   `momentscreative.ca`. It gives you records to create — typically a `MX` and
   `TXT` pair for the `send` subdomain, plus a `TXT` DKIM record.

3. **Add those records in Cloudflare.** DNS → **Records** → **Add record**, one
   per row Resend listed.

   > ⚠️ Set every one of these to **DNS only** (grey cloud, not orange). Proxying
   > a mail record breaks it. This is the single most common thing to get wrong.

   These records are additive and scoped to a `send.` subdomain — they do **not**
   disturb the existing Google Workspace MX records that deliver your actual
   mail. Leave those alone.

4. **Verify.** Back in Resend, hit **Verify**. Usually under 10 minutes.

5. **Create an API key.** Resend → **API Keys** → **Create**. Sending permission
   is enough. Copy it now — it's shown once.

6. **Store the key.** It currently lives in the account-level **Secrets Store**
   as `RESEND_API_KEY`, bound to this Worker by the `secrets_store_secrets`
   block in `wrangler.jsonc`.

   > A Secrets Store secret is **not** visible to a Worker just because it
   > exists — the binding is what makes it reachable. Without it, `env` has no
   > `RESEND_API_KEY` at all and the form fails with `code: "no_api_key"`. If you
   > ever move the secret to a different store, update `store_id` to match.

   To rotate the value: **Secrets Store** → `RESEND_API_KEY` → **Rotate**. No
   code change and no redeploy — the Worker reads it at request time.

   A plain Worker secret works too, if you'd rather (`npx wrangler secret put
   RESEND_API_KEY`). The code accepts both shapes, so nothing needs changing
   either way.

7. **Redeploy** if you changed the binding. Any push triggers a build; `npx
   wrangler deploy` works too. Rotating the value alone needs no redeploy.

8. **Send yourself a test** through the live form and confirm it lands.

### Optional overrides

Both are plain variables, not secrets. Set them only if you want to change the
defaults baked into `src/inquiry.js`:

| Variable | Default | Purpose |
| --- | --- | --- |
| `INQUIRY_TO` | `hello@momentscreative.ca` | Where inquiries land |
| `INQUIRY_FROM` | `Moments Creative <inquiries@momentscreative.ca>` | Sender; must be on the Resend-verified domain |

`INQUIRY_FROM` doesn't need to be a real mailbox — nobody sends to it. Replies go
to whoever filled in the form, because the Function sets `reply_to` to their
address. Just hit reply.

### What the endpoint does

- Rejects submissions missing a business name, name, or email, and rejects
  malformed email addresses — with wording the page shows the visitor as-is.
- Silently drops bot submissions caught by the honeypot (returns `200` so the bot
  learns nothing).
- Strips control characters and caps field lengths, so the form can't be used to
  inject mail headers or post a novel.
- HTML-escapes everything before it goes in the email body.
- Never leaks the API key. Failures carry a `code` (and, for a Resend rejection,
  the upstream status and message) so a misconfiguration is visible in DevTools →
  Network without needing log access. The visitor-facing text stays generic.

### Diagnosing a form that won't send

Open `https://momentscreative.ca/api/inquiry` in a browser. A `GET` returns a
configuration check:

```json
{
  "endpoint": "ok",
  "resendKeyConfigured": true,
  "resendKeyLooksValid": true,
  "resendKeyHasWhitespace": false,
  "sendsTo": "hello@momentscreative.ca",
  "sendsFrom": "Moments Creative <inquiries@momentscreative.ca>"
}
```

- **404 / the landing page** — the Worker script isn't running. Check that
  `wrangler.jsonc` shipped and that the build succeeded.
- **`resendKeyConfigured: false`** — the key isn't reaching the Worker. Check
  `resendKeySource` in the same response: `none` means nothing is bound (check
  the `secrets_store_secrets` block and that `store_id` matches the store),
  `secrets-store-error` means the binding exists but the read failed.
- **`resendKeyLooksValid: false`** — that isn't a Resend key (they start `re_`).
- **`resendKeyHasWhitespace: true`** — a newline came along with the paste.

If all of that looks right, submit the form and read the JSON response in
DevTools → Network → `inquiry`. `resendStatus` tells you the rest: **401** bad
key, **403** the `sendsFrom` domain isn't verified in Resend, **422** a payload
Resend rejected.

The endpoint reports whether a key exists, never its value. Delete
`onRequestGet` once the form is confirmed working if you'd rather not expose it.

---

## Running it locally

```sh
npm install
cp .dev.vars.example .dev.vars    # then paste a real key in, if testing email
npx wrangler dev
```

This runs the real Cloudflare runtime locally on `http://localhost:8787` —
static assets, routing, `_headers`, and the Worker, exactly as in production.
`.dev.vars` is gitignored; don't commit a key.

---

## Swapping in real content

### The logo

The wordmark is a text placeholder in two places — the nav and the footer, both
marked `<!-- LOGO SWAP -->` in `public/index.html`:

```html
<div class="word">Moments Creative</div>
```

Replace each with an image and add a sizing rule:

```html
<img class="logo" src="/img/logo.svg" alt="Moments Creative">
```
```css
.logo { height: 28px; width: auto; display: block; }   /* footer: ~26px */
```

Keep the element in the same spot in the flex row and nothing else moves. SVG is
worth asking the designer for — it stays sharp on every screen.

### Work example photos and video

Every card in both strips is the same shape, marked `<!-- MEDIA SWAP -->` in `public/index.html`:

```html
<div class="work-card wc1"><div class="fill"></div><div class="cap">Reel · Local boutique</div></div>
```

Swap the empty `<div class="fill">` for real media. **Nothing else changes** — the
CSS already sizes and crops anything with `class="fill"`:

```html
<!-- photo -->
<img class="fill" src="/img/work/boutique.jpg" alt="Reel still — local boutique" loading="lazy">

<!-- video thumbnail that plays on loop -->
<video class="fill" src="/img/work/pub.mp4" poster="/img/work/pub.jpg" muted loop playsinline></video>
```

Notes:
- Cards are **4:5 portrait**. Crop to that ratio before uploading — `object-fit:
  cover` will centre-crop anything else, which can cut off heads.
- Export around **800×1000px**. Bigger is wasted; these render ~250px wide.
- The `wc1`–`wc4` class only sets the placeholder colour. It becomes a no-op once
  real media covers it — harmless to leave, fine to remove.
- The caption sits directly on the media in cream text. On a light or busy photo
  it may need a scrim; add one when you have real images to judge against:
  ```css
  .work-card:has(img.fill) .cap,
  .work-card:has(video.fill) .cap {
    left: 0; right: 0; bottom: 0;
    padding: 30px 12px 10px;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
  }
  ```

### Adding more pages

Copy `public/index.html`, strip the sections you don't need, keep the `<head>`
block and the nav/footer. Everything already points at absolute paths (`/css/styles.css`,
`/js/main.js`), so a page works from any depth. If the duplicated nav and footer
start to get annoying — around the fourth page — that's the moment to introduce a
static site generator, not before.

## Still to do

- No favicon yet — browsers will request `/favicon.ico` and get a 404. Harmless,
  but worth adding with the logo.
- No `og:image`, so link previews on Facebook/LinkedIn show no picture. Add a
  1200×630 image and uncomment the tag in `public/index.html`.
- `onRequestGet` in `src/inquiry.js` is a debugging aid. Delete it once you're
  confident the form is stable.
- The form has a honeypot but no CAPTCHA. If spam ever gets through, Cloudflare
  Turnstile is the natural next step — free, and it drops into the same Function.
- Submissions exist only as email. If losing one would hurt, add a Cloudflare KV
  binding and write a copy in the Function before sending.
