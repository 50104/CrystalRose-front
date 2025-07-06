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

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell');
      return Promise.allSettled(
        urlsToCache.map(url => 
          cache.add(url).catch(error => {
            console.warn(`[Service Worker] Failed to cache ${url}:`, error);
            return null;
          })
        )
      );
    }).catch((error) => {
      console.error('[Service Worker] Install failed:', error);
    })
  );
  
  // 새 Service Worker 즉시 활성화
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
          return null;
        })
      );
    }).catch((error) => {
      console.error('[Service Worker] Activate failed:', error);
    })
  );
  self.clients.claim(); // 모든 클라이언트 제어
});

// 캐시 전략
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  
  // 브라우저 확장 프로그램 요청 무시
  if (url.startsWith('chrome-extension://') || 
      url.startsWith('moz-extension://') ||
      url.startsWith('ms-browser-extension://') ||
      url.startsWith('safari-extension://') ||
      url.startsWith('edge-extension://')) {
    return;
  }
  
  // 데이터 URL, blob URL 등 특수 스키마 무시
  if (url.startsWith('data:') || 
      url.startsWith('blob:') ||
      url.startsWith('about:')) {
    return;
  }

  // API, 인증, 외부 서비스는 캐싱 안함
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
  ) {
    return;
  }

  // POST, PUT, DELETE 요청은 캐싱 안함
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // 캐시에 있으면 반환
      if (response) {
        return response;
      }
      
      // 네트워크에서 가져오기
      return fetch(event.request).then((networkResponse) => {
        // 유효한 응답인지 확인
        if (!networkResponse || 
            networkResponse.status !== 200 || 
            networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // 응답을 복사하여 캐시에 저장
        const responseToCache = networkResponse.clone();
        
        caches.open(CACHE_NAME).then((cache) => {
          // 캐시 저장 시 에러 처리
          cache.put(event.request, responseToCache).catch((error) => {
            console.warn('[Service Worker] Cache put failed:', error);
          });
        }).catch((error) => {
          console.warn('[Service Worker] Cache open failed:', error);
        });

        return networkResponse;
      }).catch((error) => {
        console.warn('[Service Worker] Fetch failed:', error);
        
        // 오프라인 상태에서 HTML 요청이면 index.html 반환
        if (event.request.headers.get('Accept').includes('text/html')) {
          return caches.match('/index.html');
        }
        
        // 기타 요청은 에러 던지기
        throw error;
      });
    }).catch((error) => {
      console.warn('[Service Worker] Cache match failed:', error);
      
      // 캐시 실패 시 네트워크 직접 요청
      return fetch(event.request);
    })
  );
});
