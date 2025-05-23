import { useEffect, useState } from 'react';
import { axiosInstance } from '@utils/axios';
import styles from './MyBlockList.css';

export default function MyBlockList() {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBlocked = async () => {
    try {
        const url = `${process.env.REACT_APP_API_URL}/api/v1/blocks/me`;
        console.log('Request URL:', url); // 실제 URL 확인
        
        const res = await axiosInstance.get(url, {
        headers: { access: localStorage.getItem('access') },
        withCredentials: true,
      });
      setBlockedUsers(res.data);
    } catch (err) {
      console.error('Full error:', err);
      setError(err.response?.data?.message || '차단 목록 조회 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (id) => {
    try {
      await axiosInstance.delete(`${process.env.REACT_APP_API_URL}/api/v1/blocks/${id}`, {
        headers: { access: localStorage.getItem('access') },
        withCredentials: true,
      });
      setBlockedUsers(blockedUsers.filter(u => u.userNo !== id));
    } catch (err) {
      alert('차단 해제 실패');
    }
  };

  useEffect(() => {
    fetchBlocked();
  }, []);

  if (loading) return <div className={styles.loading}>로딩 중...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className="container">
      <h2 className="title">차단한 사용자</h2>
      {blockedUsers.length === 0 ? (
        <div className="noData">차단한 사용자가 없습니다.</div>
      ) : (
        <ul className="userList">
          {blockedUsers.map(user => (
            <li key={user.userNo} className="userItem">
              <div className="userInfo">
                <img
                  src={user.userProfileImg || '/default-avatar.png'}
                  alt={user.userNick}
                  className="avatar"
                />
                <span className="nickname">{user.userNick}</span>
              </div>
              <button onClick={() => handleUnblock(user.userNo)} className="unblockBtn">
                차단 해제
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}