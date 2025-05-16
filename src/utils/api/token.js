import { useEffect } from "react";
import { axiosInstance } from '@utils/axios';

// refresh 토큰으로 access 토큰을 재발급 받은 후 홈으로 이동
export function GetAccess() {
  useEffect(() => {
    const fetchAccessToken = async () => {
      await getAccessToken();
      window.location.href = '/';
    };
    fetchAccessToken();
  }, []);
}

// access 토큰 재발급 요청 함수
export const getAccessToken = async () => {
  try {
    const response = await axiosInstance.post(
      `${process.env.REACT_APP_API_URL}/reissue`,
      {},
      { withCredentials: true }
    );
    const accessToken = response.headers['access'];
    localStorage.setItem('access', accessToken);
  } catch (error) {
    console.error('토큰 갱신 실패:', error);
    throw error;
  }
};

// access 토큰 제거 후 리디렉션
export const logoutFunction = async () => {
  try {
    await axiosInstance.post(
      `${process.env.REACT_APP_API_URL}/logout`,
      {},
      { withCredentials: true }
    );
    localStorage.removeItem('access');
    window.location.href = '/';
  } catch (error) {
    console.error('로그아웃 오류', error);
    localStorage.removeItem('access');
    window.location.href = '/';
  }
};
