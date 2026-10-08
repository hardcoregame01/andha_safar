/* Blind Path service worker: makes the game installable and playable offline.
   Strategy: stale-while-revalidate for this site's own files (fast + always updates in the background).
   Requests to other sites (e.g. the online leaderboard server) are never touched. */
const CACHE = 'blind-path-v1';
const SHELL = ['./', 'index.html', 'play.html', 'mini3d.js', 'config.js', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png',
  'img/level1.jpg', 'img/level2.jpg', 'img/level3.jpg', 'img/level4.jpg', 'img/mobile.jpg'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(r, { ignoreSearch: true });
    const net = fetch(r).then(res => { if (res && res.ok) c.put(r, res.clone()); return res; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    const res = await net;
    return res || (r.mode === 'navigate' ? c.match('play.html') : Response.error());
  }));
});
