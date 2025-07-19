/* eslint-disable no-restricted-globals */
import { SW_VERSION } from './swVersion';

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);

export function register(config) {
  // 개발 환경에서도 Service Worker 허용
  if ('serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL || '/', window.location.href);
    if (publicUrl.origin !== window.location.origin) return;

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL || ''}/service-worker.${SW_VERSION}.js`;

      // 기존 Service Worker 정리
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          // 현재 도메인과 다른 scope의 Service Worker만 제거
          if (registration.scope !== `${window.location.origin}/`) {
            // console.log('Removing old service worker:', registration.scope);
            registration.unregister().catch(console.error);
          }
        });
      }).catch(console.error);

      if (isLocalhost) {
        checkValidServiceWorker(swUrl, config);
        navigator.serviceWorker.ready.then(() => {
          // console.log('Service Worker is ready (localhost)');
        }).catch(console.error);
      } else {
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      // console.log('Service Worker registered successfully:', registration.scope);
      
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) return;

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // console.log('New content is available; please refresh.');
              if (config && config.onUpdate) {
                config.onUpdate(registration);

                // 선택적으로 바로 새 서비스워커 활성화
                if (registration.waiting) {
                  registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                }
              }
            } else {
              // console.log('Content is cached for offline use.');
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Error during service worker registration:', error);
      
      // Chrome 확장 프로그램 충돌 등의 에러 처리
      if (error.message && (
          error.message.includes('chrome-extension') || 
          error.message.includes('unsupported') ||
          error.message.includes('Cache') ||
          error.message.includes('put')
      )) {
        console.warn('Service Worker registration failed due to browser extension conflict. Continuing without SW.');
        return;
      }
      
      // 기타 네트워크 에러 처리
      if (error.name === 'NetworkError' || error.name === 'TypeError') {
        console.warn('Network error during service worker registration. App will work without offline capabilities.');
        return;
      }
      
      // 심각한 에러의 경우 재시도 (최대 1회)
      if (!registerValidSW.retried) {
        registerValidSW.retried = true;
        setTimeout(() => {
          // console.log('Retrying service worker registration...');
          registerValidSW(swUrl, config);
        }, 3000);
      }
    });
}

function checkValidServiceWorker(swUrl, config) {
  fetch(swUrl, { 
    headers: { 'Service-Worker': 'script' },
    cache: 'no-cache'
  })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      // console.log('No internet connection found. App is running in offline mode.');
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => registration.unregister())
      .catch((error) => {
        console.error(error.message);
      });
  }
}

export function forceUnregisterAndReload() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((reg) => reg.unregister());
      window.location.reload();
    });
  }
}

// 캐시 및 Service Worker 완전 정리 함수
export function clearAllCaches() {
  return new Promise((resolve) => {
    if ('caches' in window) {
      caches.keys().then((cacheNames) => {
        Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        ).then(() => {
          // console.log('All caches cleared');
          resolve();
        }).catch((error) => {
          console.error('Error clearing caches:', error);
          resolve();
        });
      }).catch((error) => {
        console.error('Error getting cache names:', error);
        resolve();
      });
    } else {
      resolve();
    }
  });
}

// 개발 모드에서만 사용하는 강제 새로고침 함수
export function forceRefresh() {
  clearAllCaches().then(() => {
    forceUnregisterAndReload();
  });
}
