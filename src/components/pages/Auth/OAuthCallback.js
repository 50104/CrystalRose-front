import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // refresh 토큰이 쿠키에 저장되었는지 확인
        const cookies = document.cookie;
        if (cookies.includes('refresh=')) {
          console.log('OAuth 로그인 성공');
          navigate('/');
        } else {
          console.error('토큰이 없습니다');
          navigate('/login');
        }
      } catch (error) {
        console.error('OAuth 콜백 처리 오류:', error);
        navigate('/login');
      }
    };

    checkAuthStatus();
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