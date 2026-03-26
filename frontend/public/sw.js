const CACHE_NAME = 'tazish-pwa-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }
        // Fallback to network
        return fetch(event.request).catch((err) => {
            console.log("Offline or network failure:", err);
            // We could return a custom offline page here
        });
      })
  );
});
