import { useEffect, useState, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { axiosInstance } from '@utils/axios';
import './TimelinePage.css';

export default function RoseTimelinePage() {
  const { roseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const roseName = location.state?.nickname || '장미';

  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTimeline = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`/api/diaries/${roseId}/timeline`);
      setTimeline(res.data);
    } catch (err) {
      console.error("장미 타임라인 조회 실패", err);
      setError('타임라인 조회 실패');
    } finally {
      setLoading(false);
    }
  }, [roseId]);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  if (loading) return <div className="timeline-loading">로딩 중...</div>;
  if (error) return <div className="timeline-error">{error}</div>;

  return (
    <div className="timeline-container">
      <h1 className="timeline-title">{roseName} 타임라인</h1>
      <div className="timeline-list">
        {timeline.map(entry => (
          <div key={entry.id} className="timeline-entry">
            {entry.imageUrl && (
              <img src={entry.imageUrl} alt="타임라인 이미지" className="timeline-image" />
            )}
            <div className="timeline-text">
              <p className="timeline-date">📅 {new Date(entry.recordedAt).toLocaleDateString('ko-KR')}</p>
              <p className="timeline-note">📝 {entry.note || '메모 없음'}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="timeline-navigation">
        <div
          className="timeline-back-button"
          onClick={() => navigate('/roses/list')}
        >
          &larr; 목록으로 돌아가기
        </div>
      </div>
    </div>
  );
}
