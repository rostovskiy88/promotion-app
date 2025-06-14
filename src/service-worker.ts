// Ensure your tsconfig.json includes "WebWorker" in the "lib" array for correct Service Worker types.

const CACHE_NAME = 'promotion-app-cache-v1';
const DATA_CACHE_NAME = 'promotion-app-data-cache-v1';

const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/',
  '/static/css/',
  '/manifest.json',
  // Add more static assets to cache
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  const swEvent = event as ExtendableEvent;
  console.log('[SW] Install event');
  swEvent.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static resources');
      return cache.addAll(urlsToCache);
    })
  );
  // Force activation
  (self as ServiceWorkerGlobalScope).skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const swEvent = event as ExtendableEvent;
  console.log('[SW] Activate event');
  swEvent.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all pages
  (self as ServiceWorkerGlobalScope).clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const fetchEvent = event as FetchEvent;
  const { request } = fetchEvent;
  const url = new URL(request.url);

  // Handle API requests differently
  if (url.pathname.includes('/api/') || url.hostname.includes('firestore.googleapis.com')) {
    fetchEvent.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return fetch(request)
          .then((response) => {
            // Cache successful GET requests
            if (request.method === 'GET' && response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => {
            // Offline - serve from cache
            return cache.match(request).then((cachedResponse) => {
              if (cachedResponse) {
                console.log('[SW] Serving API data from cache:', request.url);
                return cachedResponse;
              }
              // Return offline response for API calls
              return new Response(
                JSON.stringify({ 
                  error: 'Offline', 
                  message: 'No cached data available' 
                }),
                {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            });
          });
      })
    );
  } else {
    // Handle static resources
    fetchEvent.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }
        return fetch(request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        });
      })
    );
  }
});

// Background sync event
self.addEventListener('sync', (event) => {
  const syncEvent = event as SyncEvent;
  console.log('[SW] Background sync event:', syncEvent.tag);
  
  if (syncEvent.tag === 'background-sync') {
    syncEvent.waitUntil(
      (self as ServiceWorkerGlobalScope).clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'BACKGROUND_SYNC',
            payload: { action: 'PROCESS_QUEUE' }
          });
        });
      })
    );
  }
});

// Message event - handle commands from main thread
self.addEventListener('message', (event) => {
  const msgEvent = event as MessageEvent;
  console.log('[SW] Message received:', msgEvent.data);
  
  if (msgEvent.data && msgEvent.data.type === 'SKIP_WAITING') {
    (self as ServiceWorkerGlobalScope).skipWaiting();
  }
}); 