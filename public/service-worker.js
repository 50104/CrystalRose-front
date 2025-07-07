/* eslint-disable no-restricted-globals */

const CACHE_VERSION = 'v2';
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

// 설치 시 기본 파일 캐싱
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching base files');
      return Promise.allSettled(
        urlsToCache.map(url =>
          cache.add(url).catch((error) => {
            console.warn(`[Service Worker] Failed to cache ${url}:`, error);
            return null;
          })
        )
      );
    }).catch((error) => {
      console.error('[Service Worker] Install failed:', error);
    })
  );
  self.skipWaiting(); // 즉시 활성화
});

// 활성화 시 오래된 캐시 삭제
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate');
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', key);
            return caches.delete(key);
          }
          return null;
        })
      )
    )
  );
  self.clients.claim(); // 모든 클라이언트에 적용
});

// 요청이 캐싱 대상인지 판단
function isCacheableRequest(request) {
  const url = request.url;

  // 확장 프로그램 요청, 데이터/blob 요청 제외
  if (!url.startsWith('http')) return false;
  if (url.startsWith('chrome-extension://') ||
      url.startsWith('moz-extension://') ||
      url.startsWith('ms-browser-extension://') ||
      url.startsWith('safari-extension://') ||
      url.startsWith('edge-extension://')) return false;

  if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('about:')) return false;

  // POST/PUT/DELETE 등 비GET 요청 제외
  if (request.method !== 'GET') return false;

  // API, 인증 관련 요청 제외
  if (
    url.includes('/api/') ||
    url.includes('/auth/') ||
    url.includes('/oauth/') ||
    url.includes('/reissue') ||
    url.includes('kakao.com') ||
    url.includes('google.com') ||
    url.includes('naver.com') ||
    url.includes('googleapis.com') ||
    url.includes('gstatic.com')
  ) return false;

  return true;
}

// fetch 핸들링
self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (!isCacheableRequest(request)) return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();

        // 캐시 저장 시 URL 확인
        const reqUrl = request.url;
        if (reqUrl.startsWith('http://') || reqUrl.startsWith('https://')) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache).catch((error) => {
              console.warn('[Service Worker] Cache put failed:', error);
            });
          });
        }

        return networkResponse;
      }).catch((error) => {
        console.warn('[Service Worker] Network fetch failed:', error);

        if (request.headers.get('Accept')?.includes('text/html')) {
          return caches.match('/index.html');
        }

        throw error;
      });
    }).catch((error) => {
      console.warn('[Service Worker] Cache match error:', error);
      return fetch(request);
    })
  );
});
