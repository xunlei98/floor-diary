// Network-first for pages, cache-first for local icons and Google Fonts. Data calls are never cached.
const C = 'floor-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || /(^|\.)script\.google\.com$|googleusercontent\.com$/.test(u.hostname)) return;
  const put = res => { if (res.ok || res.type === 'opaque') { const c = res.clone(); caches.open(C).then(x => x.put(r, c)); } return res; };
  if (r.mode === 'navigate') return e.respondWith(fetch(r).then(put).catch(() => caches.match(r).then(m => m || caches.match('./'))));
  if (/\.(png|webmanifest)$/.test(u.pathname) || /fonts\.(googleapis|gstatic)\.com$/.test(u.hostname))
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(put)));
});
