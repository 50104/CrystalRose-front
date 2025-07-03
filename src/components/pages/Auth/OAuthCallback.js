import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '@utils/axios';

export function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const getAccessToken = async () => {
      try {
        const response = await axiosInstance.post('/reissue');

        if (response.data.accessToken) {
          localStorage.setItem('access', response.data.accessToken);
          console.log('Access Token 저장 완료');
          window.location.href = '/';
        } else {
          throw new Error('Access Token을 받지 못했습니다');
        }
      } catch (error) {
        console.error('OAuth 콜백 처리 오류:', error);
        
        if (error.response) {
          console.error('응답 상태:', error.response.status);
          console.error('응답 데이터:', error.response.data);
          
          if (error.response.status === 400) {
            const errorMsg = error.response.data;
            if (errorMsg.includes('refresh null') || errorMsg.includes('no cookies')) {
              console.error('refresh 토큰이 없습니다. 다시 로그인해주세요.');
            } else if (errorMsg.includes('refresh expired')) {
              console.error('refresh 토큰이 만료되었습니다. 다시 로그인해주세요.');
            }
          }
        }
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