import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { oauthAxiosInstance, retryableRequest, checkNetworkStatus, clearServiceWorkerCache } from '@utils/axios';

export function OAuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('로그인 처리 중');

  useEffect(() => {
    const getAccessToken = async () => {
      try {
        // 네트워크 상태 확인
        if (!checkNetworkStatus()) {
          throw new Error('네트워크 연결을 확인해주세요.');
        }

        setStatus('토큰 요청 중...');
        
        // 재시도 로직으로 토큰 요청
        const response = await retryableRequest(
          () => oauthAxiosInstance.post('/reissue'),
          3,
          1000
        );

        if (response.data.accessToken) {
          localStorage.setItem('access', response.data.accessToken);
          console.log('Access Token 저장 완료');
          setStatus('로그인 완료! 페이지를 이동합니다...');
          
          // 약간의 지연 후 리디렉션
          setTimeout(() => {
            window.location.href = '/';
          }, 500);
        } else {
          throw new Error('Access Token을 받지 못했습니다');
        }
      } catch (error) {
        console.error('OAuth 콜백 처리 오류:', error);
        setStatus('로그인 처리 중 오류가 발생했습니다');
        
        try {
          await clearServiceWorkerCache();
          console.log('서비스 워커 캐시가 클리어되었습니다.');
        } catch (cacheError) {
          console.error('캐시 클리어 실패:', cacheError);
        }
        
        if (error.response) {
          console.error('응답 상태:', error.response.status);
          console.error('응답 데이터:', error.response.data);
          
          if (error.response.status === 400) {
            const errorMsg = error.response.data;
            if (errorMsg.includes('refresh null') || errorMsg.includes('no cookies')) {
              console.error('refresh 토큰이 없습니다. 다시 로그인해주세요.');
              setStatus('로그인 정보가 없습니다. 다시 로그인해주세요.');
            } else if (errorMsg.includes('refresh expired')) {
              console.error('refresh 토큰이 만료되었습니다. 다시 로그인해주세요.');
              setStatus('로그인이 만료되었습니다. 다시 로그인해주세요.');
            }
          }
        } else if (error.message) {
          setStatus(error.message);
        }
        
        // 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          navigate('/login');
        }, 3000);
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
      <div>{status}</div>
      <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
        잠시만 기다려주세요
      </div>
    </div>
  );
}