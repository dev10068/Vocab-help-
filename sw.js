const CACHE_NAME = 'vocabmaster-v1';

const ASSETS = [
  '/Vocab-help-/',
  '/Vocab-help-/index.html',
  '/Vocab-help-/style.css',
  '/Vocab-help-/script.js',
  '/Vocab-help-/data.json',
  '/Vocab-help-/manifest.json',
  '/Vocab-help-/icon-192.png',
  '/Vocab-help-/icon-512.png',
  '/Vocab-help-/icon-512-maskable.png',
  '/Vocab-help-/screen-mobile.png',
  '/Vocab-help-/screen-wide.png'
];

// ── Install: cache all assets ──────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// ── Activate: delete old caches ───────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: cache-first strategy ───────────────────
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => caches.match('/Vocab-help-/index.html'));
    })
  );
});
