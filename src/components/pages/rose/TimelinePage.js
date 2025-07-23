import { useEffect, useState, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { axiosInstance } from '@utils/axios';
import './TimelinePage.css';

const CARE_LABELS = {
  watering: '💧',
  fertilizer: '💊',
  pesticide: '🪰',
  adjuvant: '🧪',
  fungicide: '🧼',
  compost: '💩',
  note: '📝'
};

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
      console.log("응답:", res.data[0]);
      const sortedData = res.data.sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt));
      setTimeline(sortedData);
    } catch (err) {
      console.error("장미 타임라인 조회 실패", err);
      setError('타임라인 조회 실패');
    } finally {
      setLoading(false);
    }
  }, [roseId]);

  const handleDeleteEntry = (entry) => {
    const confirmDelete = window.confirm('정말 이 기록을 삭제하시겠습니까?');
    if (!confirmDelete) return;

    axiosInstance.delete(`/api/diaries/delete/${entry.id}`)
      .then(() => {
        alert('기록이 삭제되었습니다.');
        setTimeline(prev => prev.filter(item => item.id !== entry.id));
      })
      .catch(err => {
        console.error('삭제 실패', err);
        alert('삭제 중 오류가 발생했습니다.');
      });
  };

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  const extractCareIcons = (entry) => {
    return (entry.careTypes || [])
      .map(key => CARE_LABELS[key])
      .filter(Boolean)
      .join('');
  };

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
              <p className="timeline-date">
                {new Date(entry.recordedAt).toLocaleDateString('ko-KR')}
                <span className="timeline-icons"> {extractCareIcons(entry)}</span>
              </p>
              <p className="timeline-note">{entry.note || '메모 없음'}</p>
              {entry.isMine && (
                <button
                  className="timeline-delete-button"
                  onClick={() => handleDeleteEntry(entry)}
                >
                  삭제
                </button>
              )}
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
