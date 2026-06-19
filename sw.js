/* =========================================================
   VocabMaster — sw.js (Service Worker v2)
   ========================================================= */

const CACHE_NAME = 'vocabmaster-cache-v2';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './data.json',
  './manifest.json',
  './icon-192.png'
];

// 1. Install: cache everything
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// 2. Activate: delete OLD caches
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

// 3. Fetch: Network first, fallback to cache
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
