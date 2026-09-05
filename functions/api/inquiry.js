/**
 * POST /api/inquiry
 *
 * Cloudflare Pages Function. Receives the landing page inquiry form and emails
 * it to Mary via Resend (https://resend.com).
 *
 * Required environment variable (Pages → Settings → Variables and Secrets):
 *   RESEND_API_KEY   Resend API key. Store as a SECRET, not plaintext.
 *
 * Optional overrides (plaintext vars are fine):
 *   INQUIRY_TO       Recipient.  Default: mary@momentscreative.ca
 *   INQUIRY_FROM     Sender.     Default: Moments Creative <inquiries@momentscreative.ca>
 *                    Must be on a domain verified in Resend.
 */

const DEFAULT_TO = 'mary@momentscreative.ca';
const DEFAULT_FROM = 'Moments Creative <inquiries@momentscreative.ca>';

// Length caps, so a bot can't post a novel through the form.
const LIMITS = {
  bizname: 200,
  name: 200,
  email: 320,
  phone: 60,
  interest: 120,
  message: 5000,
};

const GENERIC_ERROR =
  'Something went wrong sending that. Please email hello@momentscreative.ca directly.';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

/** Collapse whitespace and strip control characters (incl. CR/LF, which matter in headers). */
function clean(value, max) {
  if (typeof value !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max);
}

/** Same, but keeps newlines — for the free-text message body. */
function cleanMultiline(value, max) {
  if (typeof value !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  return value.replace(/\r\n/g, '\n').replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, ' ').trim().slice(0, max);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isValidEmail(value) {
  // Deliberately permissive — the real check is whether a reply gets through.
  return /^[^\s@,;:<>"'\\]+@[^\s@,;:<>"'\\]+\.[^\s@,;:<>"'\\]{2,}$/.test(value);
}

function buildText(fields) {
  const lines = [
    'New inquiry from momentscreative.ca',
    '',
    `Business:  ${fields.bizname}`,
    `Name:      ${fields.name}`,
    `Email:     ${fields.email}`,
    `Phone:     ${fields.phone || '—'}`,
    `Looking for: ${fields.interest || '—'}`,
    '',
    'Message:',
    fields.message || '(none)',
    '',
    '—',
    `Submitted ${fields.submittedAt}`,
  ];
  return lines.join('\n');
}

function buildHtml(fields) {
  const row = (label, value) =>
    `<tr>
       <td style="padding:6px 16px 6px 0;color:#8A806E;font-size:13px;vertical-align:top;white-space:nowrap;">${escapeHtml(label)}</td>
       <td style="padding:6px 0;color:#2B2622;font-size:15px;">${escapeHtml(value)}</td>
     </tr>`;

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;background:#F7F2E7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#FFFDF9;border:1px solid #E4DAC5;border-radius:6px;padding:28px;">
    <p style="margin:0 0 4px;color:#0F5257;font-size:13px;font-weight:600;letter-spacing:.02em;">NEW INQUIRY</p>
    <h1 style="margin:0 0 20px;font-size:22px;color:#2B2622;font-weight:600;">${escapeHtml(fields.bizname)}</h1>
    <table style="border-collapse:collapse;width:100%;">
      ${row('Name', fields.name)}
      ${row('Email', fields.email)}
      ${row('Phone', fields.phone || '—')}
      ${row('Looking for', fields.interest || '—')}
    </table>
    <div style="margin-top:20px;padding-top:18px;border-top:1px solid #E4DAC5;">
      <p style="margin:0 0 8px;color:#8A806E;font-size:13px;">Message</p>
      <p style="margin:0;color:#2B2622;font-size:15px;line-height:1.6;white-space:pre-wrap;">${
        escapeHtml(fields.message || '(none)')
      }</p>
    </div>
    <p style="margin:22px 0 0;color:#8A806E;font-size:12px;">
      Reply straight to this email to reach ${escapeHtml(fields.name)}. Submitted ${escapeHtml(fields.submittedAt)}.
    </p>
  </div>
</body>
</html>`;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // --- Parse -------------------------------------------------------------
  let payload;
  try {
    payload = await request.json();
  } catch (_) {
    return json({ error: 'That submission was malformed. Please try again.' }, 400);
  }
  if (!payload || typeof payload !== 'object') {
    return json({ error: 'That submission was malformed. Please try again.' }, 400);
  }

  // --- Honeypot ----------------------------------------------------------
  // Real visitors never see this field. Answer 200 so bots learn nothing.
  if (typeof payload.website === 'string' && payload.website.trim() !== '') {
    return json({ ok: true });
  }

  // --- Validate ----------------------------------------------------------
  const fields = {
    bizname: clean(payload.bizname, LIMITS.bizname),
    name: clean(payload.name, LIMITS.name),
    email: clean(payload.email, LIMITS.email),
    phone: clean(payload.phone, LIMITS.phone),
    interest: clean(payload.interest, LIMITS.interest),
    message: cleanMultiline(payload.message, LIMITS.message),
    submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
  };

  if (!fields.bizname || !fields.name || !fields.email) {
    return json({ error: 'Please fill in your business name, your name, and an email.' }, 400);
  }
  if (!isValidEmail(fields.email)) {
    return json({ error: "That email address doesn't look right — mind checking it?" }, 400);
  }

  // --- Config ------------------------------------------------------------
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    // Not the visitor's fault; make it loud in the logs, gentle on the page.
    console.error('RESEND_API_KEY is not set — inquiry not delivered:', fields.email);
    return json({ error: GENERIC_ERROR }, 500);
  }

  const to = env.INQUIRY_TO || DEFAULT_TO;
  const from = env.INQUIRY_FROM || DEFAULT_FROM;

  // --- Send --------------------------------------------------------------
  let resendResponse;
  try {
    resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: fields.email,
        subject: `New inquiry — ${fields.bizname}`,
        text: buildText(fields),
        html: buildHtml(fields),
      }),
    });
  } catch (err) {
    console.error('Resend request failed:', err);
    return json({ error: GENERIC_ERROR }, 502);
  }

  if (!resendResponse.ok) {
    const detail = await resendResponse.text().catch(() => '');
    console.error(`Resend returned ${resendResponse.status}: ${detail}`);
    return json({ error: GENERIC_ERROR }, 502);
  }

  return json({ ok: true });
}
