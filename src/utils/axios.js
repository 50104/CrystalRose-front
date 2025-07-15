import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000',
  withCredentials: true,
  timeout: 10000, // 10초 타임아웃 설정
  headers: {
    'Content-Type': 'application/json',
  },
  // 304 상태 코드도 성공으로 처리
  validateStatus: function (status) {
    return (status >= 200 && status < 300) || status === 304;
  }
});

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response) => {
    // 304 Not Modified는 정상적인 응답으로 처리
    if (response.status === 304) {
      console.log('304 Not Modified - 캐시된 데이터 사용');
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 네트워크 오류 처리
    if (!error.response) {
      console.error('네트워크 오류:', error.message);
      return Promise.reject(new Error('네트워크 연결을 확인해주세요.'));
    }

    // 401 Unauthorized 처리
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log('401 에러 발생, 토큰 갱신 시도');
        const response = await axiosInstance.post('/reissue', {}, {
          withCredentials: true
        });
        
        if (response.status === 200 && response.data.accessToken) {
          localStorage.setItem('access', response.data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error('토큰 갱신 실패:', refreshError);
        localStorage.removeItem('access');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // 기타 HTTP 에러 처리
    const errorMessage = error.response?.data?.message || error.message || '알 수 없는 오류가 발생했습니다.';
    console.error(`HTTP ${error.response?.status} 오류:`, errorMessage);
    
    return Promise.reject(error);
  }
);

// OAuth 요청을 위한 별도 인스턴스 (조건부 요청 허용)
export const oauthAxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000',
  withCredentials: true,
  timeout: 15000, // OAuth는 더 긴 타임아웃
  headers: {
    'Content-Type': 'application/json',
  },
  // 조건부 요청(304)을 허용하기 위한 설정
  validateStatus: function (status) {
    return (status >= 200 && status < 300) || status === 304; // 304도 성공으로 처리
  }
});

// OAuth 전용 응답 인터셉터 (토큰 갱신 로직 제외)
oauthAxiosInstance.interceptors.response.use(
  (response) => {
    // 304 Not Modified는 정상적인 응답으로 처리
    if (response.status === 304) {
      console.log('OAuth 304 Not Modified - 캐시된 데이터 사용');
    }
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

// 인증이 필요 없는 요청을 위한 axios 인스턴스
export const noAuthAxios = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 서비스 워커 관련 유틸리티 함수
export const clearServiceWorkerCache = async () => {
  if ('serviceWorker' in navigator && 'caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
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
export const checkNetworkStatus = () => {
  return navigator.onLine;
};

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