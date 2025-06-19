const CACHE_NAME = 'promotion-app-cache-v1';
const DATA_CACHE_NAME = 'promotion-app-data-cache-v1';

const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/',
  '/static/css/',
  '/manifest.json',
];

self.addEventListener('install', (event: any) => {
  console.log('[SW] Install event');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache: any) => {
      return cache.addAll(urlsToCache);
    })
  );
  (self as any).skipWaiting();
});

self.addEventListener('activate', (event: any) => {
  console.log('[SW] Activate event');
  event.waitUntil(
    caches.keys().then((cacheNames: string[]) => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  (self as any).clients.claim();
});

self.addEventListener('fetch', (event: any) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.pathname.includes('/api/') || url.hostname.includes('firestore.googleapis.com')) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache: any) => {
        return fetch(request)
          .then((response: Response) => {
            if (request.method === 'GET' && response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => {
            return cache.match(request).then((cachedResponse: Response | undefined) => {
              if (cachedResponse) {
                console.log('[SW] Serving API data from cache:', request.url);
                return cachedResponse;
              }
              return new Response(
                JSON.stringify({
                  error: 'Offline',
                  message: 'No cached data available',
                }),
                {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: { 'Content-Type': 'application/json' },
                }
              );
            });
          });
      })
    );
  } else {
    event.respondWith(
      caches.match(request).then((response: Response | undefined) => {
        if (response) {
          return response;
        }
        return fetch(request).then((response: Response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache: any) => {
            cache.put(request, responseToCache);
          });
          return response;
        });
      })
    );
  }
});

self.addEventListener('sync', (event: any) => {
  console.log('[SW] Background sync event:', event.tag);

  if (event.tag === 'background-sync') {
    event.waitUntil(
      (self as any).clients.matchAll().then((clients: any[]) => {
        clients.forEach((client: any) => {
          client.postMessage({
            type: 'BACKGROUND_SYNC',
            payload: { action: 'PROCESS_QUEUE' },
          });
        });
      })
    );
  }
});

self.addEventListener('message', (event: any) => {
  console.log('[SW] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    (self as any).skipWaiting();
  }
});
