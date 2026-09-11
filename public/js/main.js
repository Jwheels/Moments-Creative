/* Moments Creative — inquiry form submission.
   Posts to the Cloudflare Pages Function at /api/inquiry, which emails
   the submission to hello@momentscreative.ca. */

(function () {
  'use strict';

  // Autoplaying loops are disorienting for anyone who has asked their system to
  // reduce motion. Honour that: pause, and hand them controls instead.
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function applyMotionPreference() {
    var videos = document.querySelectorAll('video[data-autoplay]');
    Array.prototype.forEach.call(videos, function (video) {
      if (reduce.matches) {
        video.autoplay = false;
        video.controls = true;
        video.pause();
      } else {
        video.controls = false;
        var p = video.play();
        if (p && p.catch) p.catch(function () { /* blocked by the browser; poster stands in */ });
      }
    });
  }

  applyMotionPreference();
  if (reduce.addEventListener) reduce.addEventListener('change', applyMotionPreference);

  var form = document.getElementById('inquiry-form');
  if (!form) return;

  var status = document.getElementById('form-status');
  var btn = document.getElementById('submit-btn');

  var FALLBACK_ERROR =
    'Something went wrong sending that. Please email hello@momentscreative.ca directly.';

  function setStatus(kind, text) {
    status.className = kind ? 'form-status ' + kind : 'form-status';
    status.textContent = text || '';
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    btn.disabled = true;
    btn.textContent = 'Sending...';
    setStatus('', '');

    var data = Object.fromEntries(new FormData(form));

    try {
      var res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      // The Function answers with JSON on both success and handled failures.
      var body = null;
      try {
        body = await res.json();
      } catch (_) {
        /* Non-JSON response (proxy error page, etc.) — treated as a failure below. */
      }

      if (res.ok) {
        setStatus('success', "Thanks — we'll be in touch soon.");
        form.reset();
      } else {
        // Show the server's own wording when it gave us some (e.g. "That email
        // address doesn't look right"), otherwise the generic fallback. Never
        // surface a raw browser/network error to a visitor.
        var serverMsg = body && typeof body.error === 'string' ? body.error.trim() : '';
        setStatus('error', serverMsg || FALLBACK_ERROR);
      }
    } catch (_) {
      // Offline, DNS failure, request aborted — nothing useful to tell them
      // beyond how else to reach us.
      setStatus('error', FALLBACK_ERROR);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Send inquiry';
    }
  });
})();
