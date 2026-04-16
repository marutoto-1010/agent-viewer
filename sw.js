// Bumping version invalidates all old caches on activation
const CACHE_NAME = 'agent-viewer-v3';
const STATIC_ASSETS = ['./index.html', './manifest.json'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Network-first strategy: always try network, fall back to cache when offline.
  // This ensures users see updates as soon as they're deployed.
  if (url.origin === location.origin || url.hostname === 'api.github.com') {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Pass-through for anything else (raw.githubusercontent.com etc.)
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});

// Allow the page to request an immediate update
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
