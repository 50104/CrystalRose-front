import { axiosInstance, retryableRequest, checkNetworkStatus } from '@utils/axios';
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { getAccessToken } from './token';
import { getAccess } from '../tokenStore';

export const GetUser = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [userNick, setUserNick] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const checkToken = () => {
      const token = getAccess();
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          // 토큰 만료 시간 체크
          const currentTime = Date.now() / 1000;
          if (decodedToken.exp > currentTime) {
            setIsLogin(true);
            setUserNick(decodedToken.userNick);
            setUserRole(decodedToken.userRole);
            setUserEmail(decodedToken.userEmail);
            setUserId(decodedToken.userId);
          } else { // 토큰 만료
            setIsLogin(false);
            setUserNick('');
            setUserRole('');
            setUserEmail('');
            setUserId('');
          }
        } catch (error) { // 토큰 디코딩 실패
          setIsLogin(false);
          setUserNick('');
          setUserRole('');
          setUserEmail('');
          setUserId('');
        }
      } else {
        setIsLogin(false);
        setUserNick('');
        setUserRole('');
        setUserEmail('');
        setUserId('');
      }
    };
    checkToken();
    
    // 토큰 변경 감지
    const interval = setInterval(checkToken, 30000); // 30초
    
    return () => clearInterval(interval);
  }, []);

  return { isLogin, userNick, userRole, userEmail, userId };
};

export const useUserData = () => {
  const [userData, setUserData] = useState(null);
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const result = await getUserData(setIsLogin);
        setUserData(result);
        setLoading(false);
      } catch (error) {
        if (error.response?.data === 'access token expired') {
          try {
            await getAccessToken();
            const result = await getUserData(setIsLogin);
            setUserData(result);
            setLoading(false);
          } catch (error) {
            console.error('토큰 갱신 실패:', error);
            setLoading(false);
          }
        } else {
          console.error('사용자 정보 불러오기 실패:', error);
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, []);

  return { userData, loading, isLogin };
};

export const getUserData = async (setIsLogin) => {
  const token = getAccess();
  if (!token) {
      return;
  }

  // 네트워크 상태 확인
  if (!checkNetworkStatus()) {
    throw new Error('네트워크 연결을 확인해주세요.');
  }

  setIsLogin(true);

  try {
    // 재시도 로직으로 사용자 데이터 요청
    const response = await retryableRequest(
      () => axiosInstance.get(`/api/user/data`),
      3,
      1000
    );
    return response.data;
  } catch (error) {
    console.error('사용자 데이터 요청 실패:', error);
    throw error;
  }
};

export const fetchUser = async () => {
  const token = getAccess();
  if (!token) {
    throw new Error('로그인이 필요한 요청입니다.');
  }

  const res = await axiosInstance.get('/api/user/data');
  return res.data;
};