import { useEffect, useState } from 'react';
import { axiosInstance } from '@utils/axios';
import styles from './AdminReport.css';

export default function AdminCommentReport() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCommentReports = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/api/v1/admin/comment-reports`);
      setReports(res.data);
    } catch (err) {
      setError(err.response?.data?.message || '댓글 신고 데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommentReports();
  }, []);

  if (loading) return <div className={styles.loading}>불러오는 중</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className="container">
      <h1 className="title">댓글 신고 관리</h1>
      {reports.length === 0 ? (
        <div className="noData">댓글 신고 내역이 없습니다.</div>
      ) : (
        <ul className="reportList">
          {reports.map((r) => (
            <li key={r.reportId} className="reportItem">
              <div className="header">
                <strong>{r.reportedUserNickname}</strong> 의 댓글 신고
              </div>
              <div className="details">
                <p><b>신고자:</b> {r.reporterNickname}</p>
                <p><b>사유:</b> {r.reason}</p>
                <p><b>댓글내용:</b> {r.commentContent}</p>
                <p><b>신고시간:</b> {formatDateTime(r.reportedAt)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// 시간 포맷 함수
function formatDateTime(isoString) {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${min}`;
}
