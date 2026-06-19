/* =========================================================
   VocabMaster — sw.js (Service Worker)
   Caches the app shell + data.json on install so the app
   keeps working even with no internet connection after the
   first successful visit.
   ========================================================= */

const CACHE_NAME = 'vocabmaster-cache-v2';

// Everything needed for the app to run fully offline
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './data.json',
  './manifest.json'
];

// 1. On install: pre-cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// 2. On activate: clean up old cache versions
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

// 3. On fetch: cache-first, falling back to network, then re-caching the result.
//    This means data.json updates (new words you add) are picked up next time
//    you're online, while the app still works fully offline in between.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const networkFetch = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse); // offline & not cached yet -> nothing we can do

      // Serve cached version immediately if we have it, else wait on network
      return cachedResponse || networkFetch;
    })
  );
});
