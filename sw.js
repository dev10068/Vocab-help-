const CACHE_NAME = 'vocabmaster-cache-v2';

const ASSETS_TO_CACHE = [
  '/Vocab-help-/',
  '/Vocab-help-/index.html',
  '/Vocab-help-/style.css',
  '/Vocab-help-/script.js',
  '/Vocab-help-/data.json',
  '/Vocab-help-/manifest.json',
  '/Vocab-help-/icon-192.png',
  '/Vocab-help-/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
