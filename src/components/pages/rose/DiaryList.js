import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { axiosInstance } from '@utils/axios';
import './DiaryList.css';

const CARE_LABELS = {
  watering: '💧',
  fertilizer: '💊',
  pesticide: '🪰',
  adjuvant: '🧪',
  fungicide: '🧼',
  compost: '💩',
  note: '📝'
};

export default function DiaryListPage() {
  const [diaries, setDiaries] = useState([]);
  const [careLogs, setCareLogs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [diaryRes, careLogRes] = await Promise.all([
          axiosInstance.get('/api/diaries/list'),
          axiosInstance.get('/api/diaries/carelogs/list')
        ]);

        setDiaries(diaryRes.data);

        // 날짜별 관리 항목 추출
        const logsByDate = {};
        for (const log of careLogRes.data) {
          const dateStr = new Date(log.careDate).toLocaleDateString('sv-SE');
          logsByDate[dateStr] = Object.entries(log)
            .filter(([key, value]) => CARE_LABELS[key] && value) // 관리 항목 필터
            .map(([key]) => key); // key 목록 저장
        }
        setCareLogs(logsByDate);
      } catch (err) {
        console.error(err);
        setError('성장 기록을 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="diary-list-loading">로딩 중...</div>;
  if (error) return <div className="diary-list-error">{error}</div>;

  return (
    <div className="diary-list-container">
      <div className="diary-list-header">
        <h1 className="diary-list-title">성장 기록</h1>
        <div className="diary-list-buttons">
          <Link to="/roses/list" className="diary-roses-button">내 장미</Link>
          <Link to="/diaries/register" className="diary-register-button">+ 기록 등록</Link>
        </div>
      </div>

      {diaries.length === 0 ? (
        <div className="diary-list-empty">등록된 성장 기록이 없습니다.</div>
      ) : (
        <div className="diary-grid">
          {diaries.map(diary => {
            const dateStr = new Date(diary.recordedAt).toLocaleDateString('sv-SE');
            const careItems = careLogs[dateStr] || [];

            return (
              <div className="diary-card" key={diary.id}>
                {diary.imageUrl && (
                  <img src={diary.imageUrl} alt="성장기록 이미지" className="diary-image" />
                )}
                <div className="diary-info">
                  <p className="diary-date">
                    {new Date(diary.recordedAt).toLocaleDateString('ko-KR')}
                    {careItems.length > 0 && (
                      <span className="care-dot">
                        {careItems.map(key => CARE_LABELS[key]).join('')}
                      </span>
                    )}
                  </p>
                  <p className="diary-note">
                    {diary.note || '메모 없음'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
