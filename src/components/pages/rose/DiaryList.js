import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '@utils/axios';
import CareLogModal from '../calendar/CareLogModal';
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
  const [selectedLog, setSelectedLog] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [diaryRes, careLogRes] = await Promise.all([
          axiosInstance.get('/api/diaries/list'),
          axiosInstance.get('/api/diaries/carelogs/list')
        ]);

        setDiaries(diaryRes.data);

        const logsByDate = {};
        for (const log of careLogRes.data) {
          const dateStr = new Date(log.careDate).toLocaleDateString('sv-SE');
          logsByDate[dateStr] = log;
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

  const handleCardClick = (dateStr) => {
    const log = careLogs[dateStr];
    if (log) setSelectedLog(log); 
  };

  const handleCloseModal = () => {
    setSelectedLog(null);
  };

  if (loading) return <div className="diary-list-loading">불러오는 중</div>;
  if (error) return <div className="diary-list-error">{error}</div>;

  return (
    <div className="diary-list-container">
      <div className="diary-list-header">
        <h1 className="diary-list-title">전체 성장 기록</h1>
        <div className="diary-list-buttons">
          <div style={{cursor: 'pointer'}} onClick={() => navigate('/roses/list')} className="diary-roses-button">내 장미</div>
          <div style={{cursor: 'pointer'}} onClick={() => navigate('/diaries/register')} className="diary-register-button">+ 기록 등록</div>
        </div>
      </div>

      {diaries.length === 0 ? (
        <div className="diary-list-empty">등록된 성장 기록이 없습니다.</div>
      ) : (
        <div className="diary-grid">
          {diaries.map(diary => {
            const dateStr = new Date(diary.recordedAt).toLocaleDateString('sv-SE');
            const careLog = careLogs[dateStr];
            const careItems = careLog
              ? Object.entries(careLog)
                  .filter(([key, value]) => CARE_LABELS[key] && value)
                  .map(([key]) => key)
              : [];

            return (
              <div
                className={`diary-card ${careItems.length > 0 ? '' : 'disabled'}`}
                key={diary.id}
                onClick={() => {
                  if (careItems.length > 0) handleCardClick(dateStr);
                }}
              >
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
                  <p className="diary-note">{diary.note || '메모 없음'}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedLog && (
        <CareLogModal
          log={selectedLog}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
