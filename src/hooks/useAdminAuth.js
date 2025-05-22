import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserData } from '@utils/api/user';

export const useAdminAuth = () => {
  const { userRole } = getUserData();
  const navigate = useNavigate();

  useEffect(() => {
    if (userRole !== 'ROLE_ADMIN') {
      alert('관리자만 접근 가능한 페이지입니다.');
      navigate('/');
    }
  }, [userRole, navigate]);
};
