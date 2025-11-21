
const CACHE_NAME = 'swaz-music-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/index.css',
    '/manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Handle Music Files - Cache First, Fallback to Network, Cache on Response
    if (url.pathname.startsWith('/music/') || url.pathname.endsWith('.mp3') || url.pathname.endsWith('.wav')) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request).then((networkResponse) => {
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                        return networkResponse;
                    }
                    // Clone the response before using it
                    const responseToCache = networkResponse.clone();
                    const responseToReturn = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                    return responseToReturn;
                });
            })
        );
        return;
    }

    // Handle API Calls - Network Only (don't cache API responses for now to ensure freshness)
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(fetch(event.request));
        return;
    }

    // Default Strategy - Stale While Revalidate for other assets
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                // Only cache valid responses
                if (networkResponse && networkResponse.status === 200) {
                    // Clone before caching
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Return cached response if fetch fails
                return cachedResponse;
            });
            return cachedResponse || fetchPromise;
        })
    );
});
