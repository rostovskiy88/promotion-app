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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
self.addEventListener('install', (event: any) => {
  console.log('[SW] Install event');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static resources');
      return cache.addAll(urlsToCache);
    })
  );
  // Force activation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (self as any).skipWaiting();
});

// Activate event - clean up old caches
// eslint-disable-next-line @typescript-eslint/no-explicit-any
self.addEventListener('activate', (event: any) => {
  console.log('[SW] Activate event');
  event.waitUntil(
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (self as any).clients.claim();
});

// Fetch event - serve from cache, fallback to network
// eslint-disable-next-line @typescript-eslint/no-explicit-any
self.addEventListener('fetch', (event: any) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests differently
  if (url.pathname.includes('/api/') || url.hostname.includes('firestore.googleapis.com')) {
    event.respondWith(
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
    event.respondWith(
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
self.addEventListener('sync', (event: any) => {
  console.log('[SW] Background sync event:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Notify the main thread to process offline queue
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (self as any).clients.matchAll().then((clients: any[]) => {
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
self.addEventListener('message', (event: any) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (self as any).skipWaiting();
  }
}); 