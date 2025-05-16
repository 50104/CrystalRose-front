import axiosInstance from './axiosInstance';

const instance = axiosInstance.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
});

// 요청 전에 access 토큰을 헤더에 세팅
instance.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers['access'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 에러 처리: access 토큰 만료 시 /getAccess로 리다이렉트
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Access 토큰 만료, getAccess 요청');
      window.location.href = '/getAccess';
    }
    return Promise.reject(error);
  }
);

export default instance;
