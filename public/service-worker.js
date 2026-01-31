
const CACHE_NAME = 'swaz-music-v2';
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

    // Skip chrome-extension and other non-http(s) requests
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // Skip WebSocket and socket.io requests - these should not be handled by service worker
    if (url.pathname.startsWith('/socket.io') || 
        url.pathname.includes('socket.io') ||
        event.request.headers.get('Upgrade') === 'websocket') {
        return;
    }

    // Skip Vite HMR (Hot Module Replacement) requests in development
    if (url.pathname.includes('__vite') || url.pathname.includes('@vite') || url.pathname.includes('@fs')) {
        return;
    }

    // Skip non-GET requests (Cache API only supports GET)
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip external resources (Google Fonts, CDNs, Cloudflare, etc.) - let browser handle these directly
    // External resources should not be cached by service worker to avoid CSP issues
    if (url.hostname !== self.location.hostname) {
        return;
    }

    // Skip requests to /music route if no pathname specified (malformed requests)
    if (url.pathname === '/music' || url.pathname === '/music/') {
        return;
    }

    // Handle Music Files - Cache First, Fallback to Network, Cache on Response
    if (url.pathname.startsWith('/music/') || url.pathname.endsWith('.mp3') || url.pathname.endsWith('.wav')) {
        event.respondWith(
            caches.match(event.request)
                .then((cachedResponse) => {
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
                .catch((error) => {
                    console.warn('Music file fetch failed:', error);
                    // Return a basic error response
                    return new Response('Audio file not available', {
                        status: 404,
                        statusText: 'Not Found'
                    });
                })
        );
        return;
    }

    // Handle API Calls - Network Only with error handling
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(event.request)
                .catch((error) => {
                    console.warn('API fetch failed:', error);
                    return new Response(JSON.stringify({ error: 'Network request failed' }), {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: { 'Content-Type': 'application/json' }
                    });
                })
        );
        return;
    }

    // Default Strategy - Stale While Revalidate for other assets
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                const fetchPromise = fetch(event.request)
                    .then((networkResponse) => {
                        // Only cache valid responses
                        if (networkResponse && networkResponse.status === 200) {
                            // Clone before caching
                            const responseToCache = networkResponse.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(event.request, responseToCache);
                            }).catch(() => {
                                // Silently fail cache operations
                            });
                        }
                        return networkResponse;
                    })
                    .catch((error) => {
                        // Return cached response if fetch fails
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        // If no cache, return a basic error response
                        console.warn('Fetch failed for:', url.pathname, error);
                        return new Response('Resource not available', {
                            status: 404,
                            statusText: 'Not Found'
                        });
                    });

                return cachedResponse || fetchPromise;
            })
            .catch((error) => {
                console.warn('Cache match failed:', error);
                // Try direct fetch as last resort
                return fetch(event.request).catch(() => {
                    return new Response('Service unavailable', {
                        status: 503,
                        statusText: 'Service Unavailable'
                    });
                });
            })
    );
});
