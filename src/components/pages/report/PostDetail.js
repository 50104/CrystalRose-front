import React, { useState } from 'react';
import { useUserData } from '@utils/api/user';
import { reportPost, blockUser } from '@utils/api/report';
import styles from './PostDetail.css';

const PostDetail = ({ post }) => {
  const { userData, isLogin } = useUserData();
  const [showReport, setShowReport] = useState(false);
  const [reason, setReason] = useState('');

  const handleReportSubmit = async () => {
    try {
      await reportPost(post.boardNo, reason);
      const confirmBlock = window.confirm("차단하시겠습니까?");
      if (confirmBlock) {
        await blockUser(post.writer.userNo);
        alert("차단 완료");
      } else {
        alert("신고 완료");
      }
      setShowReport(false);
      setReason('');
    } catch (err) {
      alert('신고 실패: ' + err.response?.data?.message);
    }
  };

  if (!post) return null;

  return (
    <div className={styles.postBox}>
      <h2>{post.boardTitle}</h2>
      <p>{post.boardContent}</p>
      <div className={styles.meta}>
        <span>작성자: {post.writer?.userNick}</span>
        {isLogin && userData?.userNo !== post.writer?.userNo && (
          <button onClick={() => setShowReport(true)} className={styles.reportBtn}>🚨 신고하기</button>
        )}
      </div>

      {showReport && (
        <div className={styles.reportForm}>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="신고 사유를 입력해주세요"
          />
          <button onClick={handleReportSubmit}>제출</button>
        </div>
      )}
    </div>
  );
};

export default PostDetail;
