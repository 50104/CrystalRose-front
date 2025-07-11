import { useEffect } from "react";
import { axiosInstance } from '@utils/axios';

// refresh 토큰으로 access 토큰 재발급 이후 홈으로 이동
export function GetAccess() {

  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        console.log('GetAccess: 토큰 재발급 시작');
        const response = await axiosInstance.post('/reissue');
        
        if (response.data.accessToken) {
          localStorage.setItem('access', response.data.accessToken);
          console.log('GetAccess: Access Token 저장 완료');
          window.location.href = '/';
        } else {
          throw new Error('Access Token을 받지 못했습니다');
        }
      } catch (error) {
        console.error('GetAccess: 토큰 획득 실패:', error);
        window.location.href = '/login';
      }
    };
    fetchAccessToken();
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column'
    }}>
      <div>토큰 처리 중</div>
      <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
        잠시만 기다려주세요
      </div>
    </div>
  );
}

// access 토큰 재발급 요청 함수
export const getAccessToken = async () => {
  try {
    console.log('getAccessToken: 토큰 재발급 요청');
    const response = await axiosInstance.post('/reissue');
    
    if (response.data.accessToken) {
      localStorage.setItem('access', response.data.accessToken);
      console.log('getAccessToken: 토큰 저장 완료');
      return response.data.accessToken;
    } else {
      throw new Error('서버에서 Access 토큰을 반환하지 않음');
    }
  } catch (error) {
    console.error('getAccessToken: 토큰 갱신 실패:', error);
    
    if (error.response?.status === 400) {
      const errorMsg = error.response.data;
      if (errorMsg.includes('refresh null') || 
          errorMsg.includes('no cookies') || 
          errorMsg.includes('refresh expired')) {
        localStorage.removeItem('access');
      }
    }
    throw error;
  }
};

// access 토큰 제거 후 리디렉션
export const logoutFunction = async () => {
  try {
    console.log('logoutFunction: 로그아웃 시작');
    await axiosInstance.post('/logout');
    localStorage.removeItem('access');
    console.log('logoutFunction: 로그아웃 완료');
    window.location.href = '/';
  } catch (error) {
    console.error('logoutFunction: 로그아웃 오류', error);
    localStorage.removeItem('access');
    window.location.href = '/';
  }
};