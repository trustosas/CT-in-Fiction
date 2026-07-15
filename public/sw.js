const CACHE_NAME = 'ct-image-cache-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Take control of all pages immediately
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Check if this is an image request we want to cache
  const isImage = 
    request.destination === 'image' ||
    url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)/i) ||
    url.host.includes('discordapp') ||
    url.host.includes('imgur') ||
    url.host.includes('githubusercontent');

  // Only handle GET requests for images
  if (request.method !== 'GET' || !isImage) {
    return;
  }

  // Bypass chrome-extension or other non-http protocols
  if (!url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      // 1. Try an exact match first
      return cache.match(request).then((exactResponse) => {
        if (exactResponse) {
          // If the cached response is valid, return it
          return exactResponse;
        }

        // 2. If no exact match (e.g. dynamic/expired Discord CDN query params), 
        // try matching ignoring search parameters.
        return cache.match(request, { ignoreSearch: true }).then((laxResponse) => {
          if (laxResponse) {
            console.log('[SW] Served from cache ignoring search params:', request.url);
            return laxResponse;
          }

          // 3. Not in cache: fetch from network
          return fetch(request).then((networkResponse) => {
            // Only cache valid responses (status 200 or 0 for opaque cross-origin)
            if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0)) {
              // Store in cache
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch((err) => {
            console.error('[SW] Fetch failed for:', request.url, err);
            // If the network request fails completely (offline) but we have ANY matched request 
            // in the cache, try finding a similar URL as a last-resort fallback.
            return cache.keys().then((keys) => {
              const matchedKey = keys.find(k => {
                const kUrl = new URL(k.url);
                return kUrl.pathname === url.pathname;
              });
              if (matchedKey) {
                return cache.match(matchedKey);
              }
              // Fail gracefully
              throw err;
            });
          });
        });
      });
    })
  );
});
