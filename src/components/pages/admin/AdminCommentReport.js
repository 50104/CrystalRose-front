import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { axiosInstance } from '@utils/axios';
import './AdminReport.css';

export default function AdminCommentReport() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCommentReports = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/api/v1/admin/comment-reports`);
      setReports(res.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || '댓글 신고 데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommentReports();
  }, []);

  if (loading) return <div className="loading">불러오는 중</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container">
      <h1 className="title">댓글 신고 관리</h1>
      {reports.length === 0 ? (
        <div className="noData">댓글 신고 내역이 없습니다.</div>
      ) : (
        <ul className="reportList">
          {reports.map((r) => {
            const boardNo = r.contentId ?? r.boardNo ?? null;
            const commentId = r.commentId ?? null;
            const canNavigate = Boolean(boardNo && commentId);
            const link = `/content/${boardNo}?commentId=${commentId}`;

            return (
              <li key={r.reportId} className={`reportItem ${canNavigate ? 'clickable' : 'disabled'}`}>
                <div className="header">
                  <strong>{r.reportedUserNickname}</strong> 의 댓글 신고
                </div>
                <div className="details">
                  <p><b>신고자:</b> {r.reporterNickname}</p>
                  <p><b>신고 사유:</b> {r.reason}</p>

                  <p className="row">
                    <b>해당 댓글 내용:</b>{' '}
                    {canNavigate ? (
                      <Link to={link} className="link">
                        {r.commentContent}
                      </Link>
                    ) : (
                      <span className="muted">{r.commentContent}</span>
                    )}
                  </p>

                  <p><b>접수 시간:</b> {formatDateTime(r.reportedAt)}</p>
                </div>
              </li>
            );
          })}
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
