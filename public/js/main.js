/* Moments Creative — page behaviour.
   1. Honours reduced motion for the autoplaying reel.
   2. Links the filmstrip and the phone feed to the page scroll.
   3. Posts the inquiry form to /api/inquiry, which emails the submission
      to hello@momentscreative.ca. */

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

  // Scroll-linked media.
  //
  // Filmstrip: on a desktop it slides sideways as the page scrolls. On phones and
  // tablets it stays a row you swipe. A script can only follow a touch scroll after
  // the fact, so a scroll-linked strip stutters there, and it ran through most of
  // its photos before the strip was properly on screen.
  //
  // Phone feed: it holds on the first post (the reel) until the phone is fully in
  // view, so there is time to watch it, then scrolls through the rest as the page
  // moves on. Where the browser supports scroll-driven animations the browser runs
  // this itself, off the main thread, so it is smooth on phones too (styles.css,
  // "feed-scroll"). Otherwise a desktop falls back to the script below, and a
  // phone just shows the reel.
  //
  // With reduced motion on, nothing is linked: both are scrolled by hand.
  var strip = document.querySelector('.filmstrip');
  var track = strip && strip.querySelector('.film-track');
  var phone = document.getElementById('phone');
  var feedView = phone && phone.querySelector('.phone-viewport');
  var feed = phone && phone.querySelector('.phone-feed');
  var desktop = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 721px)');
  var cssTimeline = !!(window.CSS && CSS.supports && CSS.supports('animation-timeline: view()'));
  var stripLinked = false;
  var phoneMode = 'manual'; // 'css' | 'js' | 'still' | 'manual'
  var frame = 0;

  function clamp(v) { return Math.min(1, Math.max(0, v)); }

  function feedMax() {
    return Math.max(0, feed.scrollHeight - feedView.clientHeight);
  }

  function updateLinked() {
    frame = 0;
    var vh = window.innerHeight;
    if (stripLinked && strip && track) {
      var r = strip.getBoundingClientRect();
      var p = clamp((vh - r.top) / (vh + r.height));
      var max = Math.max(0, track.scrollWidth - strip.clientWidth);
      track.style.transform = 'translate3d(' + (-max * p).toFixed(1) + 'px,0,0)';
    }
    if (phone && feed && feedView) {
      if (phoneMode === 'css') {
        // The browser animates it; it only needs to know how far the feed can travel.
        phone.style.setProperty('--feed-max', feedMax() + 'px');
      } else if (phoneMode === 'js') {
        // Same timing as the CSS version: start once the phone is fully in view,
        // finish when 60% of it has scrolled off the top.
        var pr = phone.getBoundingClientRect();
        var start = Math.max(vh - pr.height, 0);
        var end = -pr.height * 0.6;
        var pp = clamp((start - pr.top) / (start - end));
        feed.style.transform = 'translate3d(0,' + (-feedMax() * pp).toFixed(1) + 'px,0)';
      }
    }
  }

  function requestUpdate() {
    if (!frame) frame = requestAnimationFrame(updateLinked);
  }

  function applyLinking() {
    stripLinked = !reduce.matches && desktop.matches;
    phoneMode = reduce.matches ? 'manual' : cssTimeline ? 'css' : desktop.matches ? 'js' : 'still';
    if (strip) {
      strip.classList.toggle('is-linked', stripLinked);
      if (stripLinked) strip.scrollLeft = 0;
      else if (track) track.style.transform = '';
    }
    if (phone) {
      phone.classList.toggle('is-linked', phoneMode !== 'manual');
      phone.classList.toggle('is-css', phoneMode === 'css');
      if (feedView && phoneMode !== 'manual') feedView.scrollTop = 0;
      if (feed && phoneMode !== 'js') feed.style.transform = '';
    }
    updateLinked();
  }

  if (strip || phone) {
    applyLinking();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    // Image heights are reserved by CSS, but the feed's length is only final once
    // everything has loaded.
    window.addEventListener('load', requestUpdate);
    if (reduce.addEventListener) reduce.addEventListener('change', applyLinking);
    if (desktop.addEventListener) desktop.addEventListener('change', applyLinking);
  }

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
        setStatus('success', "Thanks. We'll be in touch soon.");
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
