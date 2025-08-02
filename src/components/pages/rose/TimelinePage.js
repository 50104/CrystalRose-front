import { useEffect, useState, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { axiosInstance } from '@utils/axios';
import './TimelinePage.css';
import { HiOutlinePencilAlt } from 'react-icons/hi';
import CareLogModal from '../calendar_care/CareLogModal';

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
  const [selectedLog, setSelectedLog] = useState(null);

  const SCROLL_POSITION_KEY = `timelineScrollPosition_${roseId}`; // 스크롤 위치 저장 키

  // 스크롤 위치 복원
  useEffect(() => {
    if (!loading && timeline.length > 0) {
      const savedScrollPosition = sessionStorage.getItem(SCROLL_POSITION_KEY);
      if (savedScrollPosition) {
        setTimeout(() => {
          window.scrollTo(0, parseInt(savedScrollPosition, 10));
        }, 100);
      }
    }
  }, [loading, timeline, SCROLL_POSITION_KEY]);

  // 스크롤 위치 저장
  useEffect(() => {
    const saveScrollPosition = () => {
      sessionStorage.setItem(SCROLL_POSITION_KEY, window.pageYOffset.toString());
    };
    window.addEventListener('beforeunload', saveScrollPosition);

    return () => {
      window.removeEventListener('beforeunload', saveScrollPosition);
    };
  }, [SCROLL_POSITION_KEY]);

  const handleNavigateWithScroll = (path, state = null) => {
    sessionStorage.setItem(SCROLL_POSITION_KEY, window.pageYOffset.toString());
    if (state) {
      navigate(path, { state });
    } else {
      navigate(path);
    }
  };

  const fetchTimeline = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`/api/diaries/${roseId}/timeline`);
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
    const confirmDelete = window.confirm('해당 기록을 목록에서 삭제하시겠습니까?');
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

  const handleEntryClick = async (entry) => {
    const date = entry.recordedAt;
    try {
      const res = await axiosInstance.get(`/api/diaries/carelogs/${roseId}?date=${date}`);
      const careLog = res.data;
      setSelectedLog({ ...careLog, recordedAt: date }); 
    } catch (err) {
      console.error('케어로그 단건 조회 실패', err);
      alert('관리 기록을 불러오는 데 실패했습니다.');
    }
  };

  const handleCloseModal = () => {
    setSelectedLog(null);
  };

  const handleEditLog = () => {
    if (!selectedLog) return;
    sessionStorage.setItem(SCROLL_POSITION_KEY, window.pageYOffset.toString());
    navigate(`/diaries/edit/${selectedLog.id}`, { state: selectedLog });
    setSelectedLog(null);
  };

  const extractCareIcons = (entry) => {
    return (entry.careTypes || [])
      .map(key => CARE_LABELS[key])
      .filter(Boolean)
      .join('');
  };

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  if (loading) return <div className="timeline-loading">불러오는 중</div>;
  if (error) return <div className="timeline-error">{error}</div>;

  return (
    <div className="timeline-container">
      <h1 className="timeline-title">{roseName} 타임라인</h1>
      <div className="timeline-list">
        {timeline.map(entry => (
          <div
            key={entry.id}
            className={`timeline-entry ${entry.hasCareLog ? '' : 'disabled'}`}
            onClick={() => {
              if (entry.hasCareLog) handleEntryClick(entry);
            }}
          >
            {entry.imageUrl && (
              <div className="timeline-image-wrapper">
                <img src={entry.imageUrl} alt="타임라인 이미지" className="timeline-image"/>
                {entry.isMine && (
                  <>
                    <div
                      className="timeline-delete-circle mobile-only"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEntry(entry);
                      }}
                      title="삭제"
                    >
                      ×
                    </div>
                  </>
                )}
              </div>
            )}
            <div className="timeline-text">
              <p className="timeline-date">
                {new Date(entry.recordedAt).toLocaleDateString('ko-KR')}
                <span className="timeline-icons"> {extractCareIcons(entry)}</span>
              </p>
              <p className="timeline-note">
                {entry.note || '메모 없음'}
                {entry.isMine && (
                  <HiOutlinePencilAlt
                    className="timeline-note-edit-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigateWithScroll(`/diaries/edit/${entry.id}`);
                    }}
                    title="수정"
                  />
                )}
              </p>
            </div>
            {entry.isMine && (
              <div className="timeline-button-group">
                <button
                  className="timeline-action-button delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteEntry(entry);
                  }}
                  title="삭제"
                >
                  삭제
                </button>
              </div>
            )}
          </div>

        ))}
      </div>
      <div className="timeline-navigation">
        <div
          className="timeline-back-button"
          onClick={() => {
            sessionStorage.removeItem(SCROLL_POSITION_KEY);
            navigate('/roses/list');
          }}
        >
          &larr; 목록으로 돌아가기
        </div>
      </div>
      {selectedLog && (
        <CareLogModal
          log={selectedLog}
          onClose={handleCloseModal}
          onEdit={handleEditLog}
        />
      )}
    </div>
  );
}