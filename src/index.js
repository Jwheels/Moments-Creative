/**
 * Worker entry point.
 *
 * Static assets in public/ are served before this script runs, so this only
 * sees requests with no matching file. In practice that means /api/inquiry
 * plus genuine 404s.
 */

import { onRequestGet, onRequestPost } from './inquiry.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/inquiry') {
      if (request.method === 'POST') return onRequestPost({ request, env });
      if (request.method === 'GET') return onRequestGet({ request, env });
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Allow: 'GET, POST',
        },
      });
    }

    // No asset matched and no route handled it. Serve the 404 page if one
    // exists, otherwise a plain response.
    const notFound = await env.ASSETS.fetch(new URL('/404.html', url.origin));
    if (notFound.ok) {
      return new Response(notFound.body, { status: 404, headers: notFound.headers });
    }
    return new Response('Not found', { status: 404 });
  },
};
