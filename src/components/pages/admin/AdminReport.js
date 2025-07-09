import { useEffect, useState } from 'react';
import { axiosInstance } from '@utils/axios';
import styles from './AdminReport.css';

export default function AdminReport() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/api/v1/admin/reports`);
      setReports(res.data);
    } catch (err) {
      setError(err.response?.data?.message || '신고 데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) return <div className={styles.loading}>로딩 중...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className="container">
      <h1 className="title">신고 관리</h1>
      {reports.length === 0 ? (
        <div className="noData">신고 내역이 없습니다.</div>
      ) : (
        <ul className="reportList">
          {reports.map((r) => (
            <li key={r.reportId} className="reportItem">
              <div className="header">
                <strong>{r.reportedUserNickname}</strong> 의 게시글 신고
              </div>
              <div className="details">
                <p><b>신고자:</b> {r.reporterNickname}</p>
                <p><b>사유:</b> {r.reason}</p>
                <p><b>내용:</b> {r.postContent}</p>
                <p><b>시간:</b> {r.reportedAt}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
