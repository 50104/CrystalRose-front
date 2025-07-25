import { jwtDecode } from 'jwt-decode';
import { axiosInstance } from '@utils/axios';

// access 토큰 재발급 요청 함수
export const getAccessToken = async () => {
  const token = localStorage.getItem('access');

  if (token) {
    try {
      const decoded = jwtDecode(token);
      const now = Math.floor(Date.now() / 1000);

      if (decoded.exp > now + 30) { // 30초 여유
        console.log('유효한 AT');
        return token;
      }
    } catch (e) {
      console.warn('JWT 디코딩 실패, 재발급 시도');
    }
  }

  try {
    console.log('AT 재발급 요청');
    const response = await axiosInstance.post('/reissue', {}, {
      withCredentials: true,
    });

    if (response.data.accessToken) {
      localStorage.setItem('access', response.data.accessToken);
      console.log('AT 저장 완료');
      return response.data.accessToken;
    } else {
      throw new Error('AT 반환 실패');
    }
  } catch (error) {
    console.error('AT 갱신 실패:', error);

    if (error.response?.status === 400) {
      const errorMsg = error.response.data;
      if (
        errorMsg.includes('refresh null') ||
        errorMsg.includes('no cookies') ||
        errorMsg.includes('refresh expired')
      ) {
        localStorage.removeItem('access');
      }
    }

    throw error;
  }
};

// access 토큰 제거 후 리디렉션
export const logoutFunction = async () => {
  try {
    await axiosInstance.post('/logout');
    localStorage.removeItem('access');
    window.location.href = '/';
  } catch (error) {
    console.error('logoutFunction: 로그아웃 오류', error);
    localStorage.removeItem('access');
    window.location.href = '/';
  }
};