/* eslint-disable no-restricted-globals */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `dodorose-cache-${CACHE_VERSION}`;
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/manifest.json'
];

// 새 워커 강제 활성화
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch((error) => {
        console.warn('[Service Worker] Cache addAll failed:', error);
        // 개별 리소스 캐싱 시도
        return Promise.allSettled(
          urlsToCache.map(url => cache.add(url).catch(e => console.warn(`Failed to cache ${url}:`, e)))
        );
      });
    }).catch((error) => {
      console.error('[Service Worker] Install failed:', error);
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate');
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return null;
        })
      )
    ).catch((error) => {
      console.error('[Service Worker] Activate failed:', error);
    })
  );
});

// 캐시 전략
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Chrome 확장 프로그램 요청 무시
  if (url.startsWith('chrome-extension://') || 
      url.startsWith('moz-extension://') ||
      url.startsWith('ms-browser-extension://')) {
    return;
  }

  // API, 인증은 캐싱 안함
  if (
    url.includes('/api/') ||
    url.includes('/auth/') ||
    url.includes('/oauth/') ||
    url.includes('/reissue') ||
    url.includes('kakao.com') ||
    url.includes('google.com') ||
    url.includes('naver.com')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;
      return fetch(event.request).then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === 'basic'
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache).catch((error) => {
              console.warn('[Service Worker] Cache put failed:', error);
            });
          }).catch((error) => {
            console.warn('[Service Worker] Cache open failed:', error);
          });
        }
        return networkResponse;
      }).catch((error) => {
        console.warn('[Service Worker] Fetch failed:', error);
        // 오프라인 상태에서 캐시된 리소스 반환
        return caches.match('/index.html');
      });
    }).catch((error) => {
      console.warn('[Service Worker] Cache match failed:', error);
      return fetch(event.request);
    })
  );
});
