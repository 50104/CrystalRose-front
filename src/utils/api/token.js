import { jwtDecode } from 'jwt-decode';
import { axiosInstance } from '@utils/axios';
import { clearAccess, getAccess, setAccess } from '../tokenStore';

// access 토큰 재발급 요청 함수
export const getAccessToken = async () => {
  const token = getAccess();
  if (token) {
    try {
      const { exp } = jwtDecode(token);
      const now = Math.floor(Date.now() / 1000);
      if (exp > now + 30) return token; // 30초 여유
    } catch (_) { /* ignore */ }
  }

  // 쿠키의 refresh로 재발급
  const r = await axiosInstance.post('/reissue', {}, { withCredentials: true });
  if (r.data?.accessToken) {
    setAccess(r.data.accessToken);
    return r.data.accessToken;
  }
  throw new Error('AT reissue failed');
};

export const logoutFunction = async () => {
  try {
    await axiosInstance.post('/logout');
  } finally {
    clearAccess();
    window.location.href = '/';
  }
};