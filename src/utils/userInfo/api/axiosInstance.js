import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
});

// 요청 전 인터셉터로 토큰을 최신으로 설정
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

export default instance;
