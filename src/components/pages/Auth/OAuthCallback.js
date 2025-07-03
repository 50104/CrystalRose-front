import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '@utils/axios';

export function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const getAccessToken = async () => {
      try {
        // refresh 토큰 쿠키 저장 확인
        const cookies = document.cookie;
        if (!cookies.includes('refresh=')) {
          console.error('refresh 토큰이 없습니다');
          navigate('/login');
          return;
        }

        const response = await axiosInstance.post('/reissue');

        if (response.data.accessToken) {
          localStorage.setItem('access', response.data.accessToken);
          console.log('OAuth 로그인 및 토큰 저장 성공');
          navigate('/');
        } else {
          throw new Error('Access Token을 받지 못했습니다');
        }
      } catch (error) {
        console.error('OAuth 콜백 처리 오류:', error);
        navigate('/login');
      }
    };

    getAccessToken();
  }, [navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column'
    }}>
      <div>로그인 처리 중</div>
      <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
        잠시만 기다려주세요
      </div>
    </div>
  );
}