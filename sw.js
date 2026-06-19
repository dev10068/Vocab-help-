/* =========================================================
   VocabMaster — sw.js (Service Worker)
   Caches the app shell + data.json on install so the app
   keeps working even with no internet connection after the
   first successful visit.
   ========================================================= */

const CACHE_NAME = 'vocabmaster-cache-v2'; // version badha diya
const ASSETS_TO_CACHE = ['./', './index.html', './style.css', './script.js', './data.json', './manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)));
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
