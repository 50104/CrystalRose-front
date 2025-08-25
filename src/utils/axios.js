// src/utils/axios.js
import axios from 'axios';
import { getAccess, setAccess, clearAccess } from './tokenStore';

export const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000',
  withCredentials: true,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  validateStatus: (s) => (s >= 200 && s < 300) || s === 304,
});

// reissue 전용 클라이언트(반복 호출 방지)
export const reissueClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000',
  withCredentials: true,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// 동시 갱신 제어
let isRefreshing = false;
let refreshWaiters = [];
const onRefreshed = (newToken) => {
  refreshWaiters.forEach((cb) => cb(newToken));
  refreshWaiters = [];
};

// 요청 인터셉터
axiosInstance.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  const url = config.url || '';

  if (config.skipAuth) {
    delete config.headers.Authorization;
    return config;
  }

  if (url.includes('/reissue')) { // /reissue 예외
    delete config.headers.Authorization;
    return config;
  }

  try { // 외부 도메인 토큰 제거
    const base = new URL(axiosInstance.defaults.baseURL);
    const target = new URL(url, axiosInstance.defaults.baseURL);
    if (target.origin !== base.origin) {
      delete config.headers.Authorization;
      return config;
    }
  } catch (e) {
  }

  const token = getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
}, (err) => Promise.reject(err));

// 응답 인터셉터: 401 → /reissue → 메모리에만 저장
axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config || {};
    const status = error.response?.status;
    const url = original?.url || '';

    if (!error.response) return Promise.reject(error); // 네트워크 오류

    if (url.includes('/reissue')) { // 무한루프 방지
      return Promise.reject(error);
    }

    if (status === 401 && !original._retry) {
      original._retry = true;

      // 다른 요청이 갱신 진행시 기다렸다가 재시도
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshWaiters.push((newToken) => {
            if (newToken) {
              original.headers = original.headers || {};
              original.headers.Authorization = `Bearer ${newToken}`;
              resolve(axiosInstance(original));
            } else {
              reject(error);
            }
          });
        });
      }

      // /reissue 1회 호출
      isRefreshing = true;
      try {
        const r = await reissueClient.post('/reissue', {});
        const newToken = r.data?.accessToken;
        if (newToken) setAccess(newToken);
        isRefreshing = false;
        onRefreshed(newToken);

        // 원래 요청 재시도
        original.headers = original.headers || {};
        if (newToken) original.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(original);
      } catch (e) {
        isRefreshing = false;
        onRefreshed(null);
        clearAccess();
        window.location.href = '/login';
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  }
);

// OAuth 인스턴스
export const oauthAxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000',
  withCredentials: true,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
  validateStatus: (status) => (status >= 200 && status < 300) || status === 304
});

// OAuth 전용 응답 인터셉터 (토큰 갱신 로직 제외)
oauthAxiosInstance.interceptors.response.use(
  (response) => {
    if (response.status === 304) console.log('OAuth 304 Not Modified - 캐시된 데이터 사용');
    return response;
  },
  (error) => {
    if (!error.response) {
      console.error('OAuth 네트워크 오류:', error.message);
      return Promise.reject(new Error('OAuth 서버 연결을 확인해주세요.'));
    }
    const errorMessage = error.response?.data?.message || error.message || 'OAuth 인증 오류가 발생했습니다.';
    console.error(`OAuth HTTP ${error.response?.status} 오류:`, errorMessage);
    return Promise.reject(error);
  }
);

// 인증이 필요 없는 인스턴스
export const noAuthAxios = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// 서비스 워커 관련 유틸리티 함수
export const clearServiceWorkerCache = async () => {
  if ('serviceWorker' in navigator && 'caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
      console.log('Service worker cache cleared');
    } catch (error) {
      console.error('Service worker cache clear failed:', error);
    }
  }
};

// 서비스 워커 재등록 함수
export const reregisterServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      // 기존 서비스 워커 등록 해제
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(registration => registration.unregister()));
      
      // 캐시 클리어
      await clearServiceWorkerCache();
      
      console.log('Service worker unregistered and cache cleared');
      
      // 페이지 새로고침하여 새로운 서비스 워커 등록
      window.location.reload();
    } catch (error) {
      console.error('Service worker reregistration failed:', error);
    }
  }
};

// 네트워크 상태 확인 함수
export const checkNetworkStatus = () => navigator.onLine;

// 재시도 가능한 axios 요청 함수
export const retryableRequest = async (requestFn, maxRetries = 3, initialDelay = 1000) => {
  let delay = initialDelay;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      console.log(`요청 실패, ${delay}ms 후 재시도 (${i + 1}/${maxRetries})`);
      const currentDelay = delay;
      await new Promise(resolve => setTimeout(resolve, currentDelay));
      delay *= 2; // 지수 백오프
    }
  }
};