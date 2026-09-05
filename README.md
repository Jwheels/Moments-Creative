# Moments Creative

Landing page for [momentscreative.ca](https://momentscreative.ca). Static site,
no build step, deployed on Cloudflare Pages, with one Pages Function that emails
inquiry form submissions to `hello@momentscreative.ca`.

```
index.html              The landing page (markup + copy only)
css/styles.css          All styling — the Tide & Table design system
js/main.js              Inquiry form submission handling
functions/api/inquiry.js  Serverless endpoint: validates + emails submissions
_headers                Security headers applied by Cloudflare Pages
.dev.vars.example       Template for local secrets (copy to .dev.vars)
```

Cloudflare Pages turns anything under `functions/` into a route automatically, so
`functions/api/inquiry.js` is served at `/api/inquiry`. There is nothing to build
and no dependencies to install — the folder is the site.

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

## Part 1 — Deploy to Cloudflare Pages

Two ways in. **Git is the better one** — every push redeploys automatically.

### Option A: connect the Git repo (recommended)

1. Push this repo to GitHub if it isn't there already.
2. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git**.
3. Pick this repository. On the build settings screen:
   - **Framework preset:** `None`
   - **Build command:** *leave empty*
   - **Build output directory:** `/`
4. **Save and Deploy.** First build takes about a minute.

You'll get a URL like `moments-creative.pages.dev`. That's the live site — the
custom domain comes next.

### Option B: drag and drop

Workers & Pages → **Create** → **Pages** → **Upload assets**, then drag the whole
folder in (the `functions` folder included — that's what makes the form work).
Fine for a one-off, but you'll re-upload by hand for every change.

---

## Part 2 — Connect momentscreative.ca

Because the domain is already in the same Cloudflare account, this is mostly
confirmation clicks — you won't touch a registrar or edit nameservers.

1. Open your Pages project → **Custom domains** tab → **Set up a custom domain**.
2. Enter `momentscreative.ca`. Cloudflare recognises the domain as yours, shows
   you the DNS record it's about to create, and asks you to confirm. Accept it.
   It adds a `CNAME` at the root (flattened automatically — this is why it works
   at the apex without an A record).
3. Repeat for `www.momentscreative.ca`. Add both, always — visitors type both.
4. Status goes **Pending → Active**, usually within a minute or two. The SSL
   certificate is issued automatically; give it up to ~15 minutes before worrying.

### Make one of them canonical

With both hostnames live, pick one as the real address so you don't split SEO.
The site's `<link rel="canonical">` currently points at the apex
(`https://momentscreative.ca/`), so redirect `www` to it:

- DNS tab → confirm `www` exists (the step above created it).
- **Rules** → **Redirect Rules** → **Create rule**:
  - **If** — Hostname equals `www.momentscreative.ca`
  - **Then** — Dynamic redirect, status **301**, expression
    `concat("https://momentscreative.ca", http.request.uri.path)`

If you'd rather `www` be the canonical one, flip the rule and update the
`canonical` and `og:url` tags in `index.html` to match.

### Check it worked

```sh
curl -sI https://momentscreative.ca | head -3
curl -sI https://www.momentscreative.ca | head -3   # expect 301
```

---

## Part 3 — Make the inquiry form deliver email

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
- **One secret** stored in the Pages project: `RESEND_API_KEY`.

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

6. **Store it in Cloudflare.** Pages project → **Settings** →
   **Variables and secrets** → **Add**:
   - Type: **Secret** (not plaintext — this encrypts it and hides it from the UI)
   - Name: `RESEND_API_KEY`
   - Value: the key
   - Add it to **Production**, and to **Preview** too if you want preview
     deployments to send.

7. **Redeploy.** Deployments → **Retry deployment** on the latest one. Environment
   variables are read at deploy time, so the existing deployment won't see the new
   secret until you do this.

8. **Send yourself a test** through the live form and confirm it lands.

### Optional overrides

Both are plain variables, not secrets. Set them only if you want to change the
defaults baked into `functions/api/inquiry.js`:

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

- **404 / the landing page** — the Function isn't deployed. The `functions/`
  folder didn't ship, or the project is a Worker rather than Pages.
- **`resendKeyConfigured: false`** — the secret isn't bound. Add it, then
  redeploy; env vars are read at deploy time.
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
cp .dev.vars.example .dev.vars    # then paste a real key in, if testing email
npx wrangler pages dev .
```

Serves the site with Functions on `http://localhost:8788`. `.dev.vars` is
gitignored — don't commit a key.

For a quick look at just the page (no form backend), `python3 -m http.server` is
enough; the form will show its fallback error, which is expected.

---

## Swapping in real content

### The logo

The wordmark is a text placeholder in two places — the nav and the footer, both
marked `<!-- LOGO SWAP -->` in `index.html`:

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

Every card in both strips is the same shape, marked `<!-- MEDIA SWAP -->`:

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

Copy `index.html`, strip the sections you don't need, keep the `<head>` block and
the nav/footer. Everything already points at absolute paths (`/css/styles.css`,
`/js/main.js`), so a page works from any depth. If the duplicated nav and footer
start to get annoying — around the fourth page — that's the moment to introduce a
static site generator, not before.

## Still to do

- No favicon yet — browsers will request `/favicon.ico` and get a 404. Harmless,
  but worth adding with the logo.
- No `og:image`, so link previews on Facebook/LinkedIn show no picture. Add a
  1200×630 image and uncomment the tag in `index.html`.
- The form has a honeypot but no CAPTCHA. If spam ever gets through, Cloudflare
  Turnstile is the natural next step — free, and it drops into the same Function.
- Submissions exist only as email. If losing one would hurt, add a Cloudflare KV
  binding and write a copy in the Function before sending.
