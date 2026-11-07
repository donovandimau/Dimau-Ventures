/* Dimau service worker (Workbox 7). Copy into any Dimau app; change APP and PRECACHE only.
   Behaviour: the page itself is network-first (so a new release reaches returning visitors on
   the next open — the old FHTB "stuck on the old version" problem cannot happen), everything
   else is served from cache while refreshing in the background, and the app opens offline. */
importScripts('https://cdn.jsdelivr.net/npm/workbox-sw@7/build/workbox-sw.js');

const APP = 'dimau-ventures';
const VERSION = '2026-11-07-8';            // bump on every release — this is what tells returning phones a new version exists
const PRECACHE = ['/', '/dimau-pwa.js'];

workbox.setConfig({ debug: false });
workbox.core.setCacheNameDetails({ prefix: APP, suffix: VERSION });

// Precache the app shell so it opens offline.
workbox.precaching.precacheAndRoute(PRECACHE.map(url => ({ url, revision: VERSION })));
workbox.precaching.cleanupOutdatedCaches();

// Pages: network first (fresh release wins), cache if offline.
workbox.routing.registerRoute(
  ({ request }) => request.mode === 'navigate',
  new workbox.strategies.NetworkFirst({ cacheName: APP + '-pages', networkTimeoutSeconds: 4 })
);

// Shared Dimau widgets + CDN libraries: serve cached copy, refresh in the background.
workbox.routing.registerRoute(
  ({ url }) => /fijian-assistant-api\.vercel\.app|cdn\.jsdelivr\.net|unpkg\.com|fonts\.(googleapis|gstatic)\.com/.test(url.hostname),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: APP + '-libs',
    plugins: [new workbox.expiration.ExpirationPlugin({ maxEntries: 40, maxAgeSeconds: 30 * 24 * 3600 }), new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] })]
  })
);

// Images and fonts.
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'image' || request.destination === 'font',
  new workbox.strategies.CacheFirst({
    cacheName: APP + '-assets',
    plugins: [new workbox.expiration.ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 60 * 24 * 3600 }), new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] })]
  })
);

// Never cache payments / Supabase calls.
workbox.routing.registerRoute(({ url }) => /supabase\.co|stripe\.com/.test(url.hostname), new workbox.strategies.NetworkOnly());

// The "Reload" button on the update bar sends this.
self.addEventListener('message', e => { if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting(); });
workbox.core.clientsClaim();
