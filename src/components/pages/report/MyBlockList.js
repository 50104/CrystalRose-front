import { useEffect, useState } from 'react';
import { axiosInstance } from '@utils/axios';
import styles from './MyBlockList.css';

export default function MyBlockList() {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBlocked = async () => {
    try {
        const url = `/api/v1/blocks/me`;
        const res = await axiosInstance.get(url);
      setBlockedUsers(res.data);
    } catch (err) {
      console.error('Full error:', err);
      setError(err.response?.data?.message || '차단 목록 조회 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (id) => {
    const confirmBlock = window.confirm("차단을 해제하시겠습니까?");
    if (!confirmBlock) return;
    try {
      await axiosInstance.delete(`/api/v1/blocks/${id}`);
      setBlockedUsers(blockedUsers.filter(u => u.userNo !== id));
    } catch (err) {
      alert('차단 해제 실패');
    }
  };

  useEffect(() => {
    fetchBlocked();
  }, []);

  if (loading) return <div className={styles.loading}>불러오는 중</div>;
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