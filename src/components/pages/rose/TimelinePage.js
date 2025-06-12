import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { axiosInstance } from '@utils/axios';
import './DiaryList.css';

export default function RoseTimelinePage() {
  const { roseId } = useParams();
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTimeline();
  }, [roseId]);

  const fetchTimeline = async () => {
    try {
      const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/diaries/${roseId}/timeline`);
      setTimeline(res.data);
    } catch (err) {
      console.error("장미 타임라인 조회 실패", err);
      setError('타임라인 조회 실패');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="diary-list-loading">로딩 중...</div>;
  if (error) return <div className="diary-list-error">{error}</div>;

  return (
    <div className="diary-list-container">
      <h1 className="diary-list-title">🌹 장미 타임라인</h1>
      <div className="diary-grid">
        {timeline.map(entry => (
          <div key={entry.id} className="diary-card">
            {entry.imageUrl && (
              <img src={entry.imageUrl} alt="타임라인 이미지" className="diary-image" />
            )}
            <div className="diary-info">
              <p className="diary-date">📅 {new Date(entry.recordedAt).toLocaleDateString('ko-KR')}</p>
              <p className="diary-note">📝 {entry.note || '메모 없음'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
