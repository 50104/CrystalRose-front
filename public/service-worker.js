/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'dodorose-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // API 요청은 우회하여 조건부 요청(304) 허용
  if (event.request.url.includes('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  if (event.request.url.includes('/auth/') || 
      event.request.url.includes('/oauth/') ||
      event.request.url.includes('/reissue') ||
      event.request.url.includes('naver.com') ||
      event.request.url.includes('google.com') ||
      event.request.url.includes('kakao.com')) {

    event.respondWith(fetch(event.request));
    return;
  }

  // 정적 리소스만 캐시 처리
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;

      return fetch(event.request).catch((error) => {
        console.error('[Service Worker] Fetch failed:', error);
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
        throw error;
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate');
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (!cacheWhitelist.includes(key)) {
            return caches.delete(key);
          }
          return Promise.resolve(); 
        })
      );
    })
  );
});
