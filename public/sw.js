const CACHE_NAME = 'truco-cache-v3';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/icon.svg',
  '/manifest.json',
];

// Pre-cache on install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Clear old caches on activate
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => clients.claim())
  );
});

// Network-first with cache fallback
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET, cross-origin, and dev server requests
  if (
    event.request.method !== 'GET' ||
    url.origin !== location.origin ||
    url.pathname.startsWith('/@') ||
    url.pathname.startsWith('/node_modules') ||
    url.pathname.includes('hot-update') ||
    url.pathname === '/src/main.tsx' ||
    url.pathname.startsWith('/src/')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.ok) {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, resClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) return cachedResponse;
          // For navigation requests, return cached index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('', { status: 408 });
        });
      })
  );
});
