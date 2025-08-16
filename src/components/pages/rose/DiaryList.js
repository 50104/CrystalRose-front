import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '@utils/axios';
import CareLogModal from '../calendar_care/CareLogModal';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
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
  const [sortOrder, setSortOrder] = useState('desc');
  const navigate = useNavigate();

  const SCROLL_POSITION_KEY = 'diaryListScrollPosition'; // 스크롤 위치 저장 키

  // 스크롤 위치 복원
  useEffect(() => {
    if (!loading && diaries.length > 0) {
      const savedScrollPosition = sessionStorage.getItem(SCROLL_POSITION_KEY);
      if (savedScrollPosition) {
        setTimeout(() => {
          window.scrollTo(0, parseInt(savedScrollPosition, 10));
        }, 100);
      }
    }
  }, [loading, diaries]);

  // 스크롤 위치 저장
  useEffect(() => {
    const saveScrollPosition = () => {
      sessionStorage.setItem(SCROLL_POSITION_KEY, window.pageYOffset.toString());
    };
    window.addEventListener('beforeunload', saveScrollPosition);
    return () => window.removeEventListener('beforeunload', saveScrollPosition);
  }, []);

  const handleNavigateWithScroll = (path) => {
    sessionStorage.setItem(SCROLL_POSITION_KEY, window.pageYOffset.toString());
    navigate(path);
  };

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

  const handleCloseModal = () => setSelectedLog(null);

  if (loading) return <div className="diary-list-loading">불러오는 중</div>;
  if (error) return <div className="diary-list-error">{error}</div>;

  const sortedDiaries = [...diaries].sort((a, b) => {
    const dateA = new Date(a.recordedAt);
    const dateB = new Date(b.recordedAt);
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  return (
    <div className="diary-list-container">
      <div className="diary-list-header">
        <div className="diary-title-button">
          <h1 className="diary-list-title">전체 성장 기록</h1>
          <button
            className="diary-list-toggle-sort-btn"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            title={sortOrder === 'asc' ? '날짜 내림차순' : '날짜 오름차순'}
          >
            {sortOrder === 'asc' ? <FaArrowUp /> : <FaArrowDown />}
          </button>
        </div>

        <div className="diary-list-buttons">
          <div
            onClick={() => {
              sessionStorage.removeItem(SCROLL_POSITION_KEY);
              navigate('/roses/list');
            }}
            className="diary-roses-button"
          >
            내 장미
          </div>
          <div
            onClick={() => handleNavigateWithScroll('/diaries/register')}
            className="diary-register-button"
          >
            + 기록 등록
          </div>
        </div>
      </div>

      {diaries.length === 0 ? (
        <div className="diary-list-empty">등록된 성장 기록이 없습니다.</div>
      ) : (
        <div className="diary-grid">
          {sortedDiaries.map(diary => {
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

      {selectedLog && <CareLogModal log={selectedLog} onClose={handleCloseModal} />}
    </div>
  );
}
