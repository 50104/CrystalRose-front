import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './WikiList.css';
import { noAuthAxios, axiosInstance } from '@utils/axios';
import { GetUser } from '@utils/api/user';

export default function WikiListPage() {
  const [wikiEntries, setWikiEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [disabledWikiIds, setDisabledWikiIds] = useState([]);
  const [modificationTargetWikiIds, setModificationTargetWikiIds] = useState([]);
  const { isLogin } = GetUser();
  const navigate = useNavigate();

  const SCROLL_POSITION_KEY = 'wikiListScrollPosition'; // 스크롤 위치 저장 키

  useEffect(() => {
    const fetchMyWikiIds = async () => {
      try {
        const res = await axiosInstance.get('/api/roses/mine/wiki-ids');
        setDisabledWikiIds(res.data);
      } catch (err) {
        console.error('내 장미 도감 ID 목록 조회 실패', err);
      }
    };

    const fetchModificationTargets = async () => {
      try {
        const res = await axiosInstance.get('/api/v1/wiki/user/modification/list');
        const targetWikiIds = res.data
          .filter(item => item.status === 'PENDING' || item.status === 'REJECTED')
          .map(item => item.originalWikiId);
        setModificationTargetWikiIds(targetWikiIds);
      } catch (err) {
        console.error('도감 수정 요청 목록 조회 실패', err);
      }
    };

    const init = async () => {
      if (isLogin) {
        await fetchMyWikiIds();
      }
      await fetchModificationTargets();
      await fetchWikiEntries();
    };

    init();
  }, [isLogin, setModificationTargetWikiIds]);

  // 스크롤 위치 복원
  useEffect(() => {
    if (!loading && wikiEntries.length > 0) {
      const savedScrollPosition = sessionStorage.getItem(SCROLL_POSITION_KEY);
      if (savedScrollPosition) {
        setTimeout(() => {
          window.scrollTo(0, parseInt(savedScrollPosition, 10));
        }, 100);
      }
    }
  }, [loading, wikiEntries]);

  // 스크롤 위치 저장
  useEffect(() => {
    const saveScrollPosition = () => {
      sessionStorage.setItem(SCROLL_POSITION_KEY, window.pageYOffset.toString());
    };
    window.addEventListener('beforeunload', saveScrollPosition);

    return () => {
      window.removeEventListener('beforeunload', saveScrollPosition);
    };
  }, []);

  const handleDetailNavigation = (entryId) => {
    sessionStorage.setItem(SCROLL_POSITION_KEY, window.pageYOffset.toString());
    navigate(`/wiki/detail/${entryId}`);
  };

  const handleRoseRegistration = (e, entry) => {
    e.stopPropagation();
    sessionStorage.setItem(SCROLL_POSITION_KEY, window.pageYOffset.toString());
    navigate('/rose/register', {
      state: {
        roseData: {
          wikiId: entry.id,
          varietyName: entry.name,
          imageUrl: ''
        }
      }
    });
  };

  const fetchWikiEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await noAuthAxios.get(`/api/v1/wiki/list`);
      const entries = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data.data)
          ? response.data.data
          : [];
      setWikiEntries(entries);
    } catch (err) {
      setError(err.response?.data?.message || err.message || '데이터를 불러오는 데 실패했습니다.');
      console.error('Error fetching wiki entries:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="wiki-list-loading-container">
        <div className="wiki-list-loading-text">불러오는 중</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wiki-list-error-container">
        <p>오류: {error}</p>
        <button onClick={fetchWikiEntries} className="wiki-list-retry-button">
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="wiki-list-container">
      <div className="wiki-list-header">
        <h1 className="wiki-list-title">장미 도감 목록</h1>
        <div onClick={() => navigate('/wiki/register')} className="wiki-register-button">
          + 도감 등록
        </div>
      </div>
      
      {wikiEntries.length === 0 ? (
        <div className="wiki-list-no-entries">
          등록된 장미 도감이 없습니다.
        </div>
      ) : (
        <div className="wiki-entries-grid">
          {wikiEntries.map(entry => (
            <div key={entry.id} className="wiki-entry-card-link" onClick={() => handleDetailNavigation(entry.id)}>
              <div className="wiki-entry-card">
                <div className="wiki-image-wrapper">
                  {entry.imageUrl && (
                    <img src={entry.imageUrl} alt={entry.name} className="wiki-entry-image" />
                  )}
                  {isLogin && !disabledWikiIds.includes(entry.id) && (
                    <div
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => handleRoseRegistration(e, entry)}
                      className="wiki-register-overlay-button"
                    >
                      내 장미로 등록
                    </div>
                  )}
                  <div className="wiki-entry-content">
                    <div className="wiki-entry-header">
                      <h2 className="wiki-entry-name">{entry.name}</h2>
                        <div className="wiki-entry-name-row">
                          <p className="wiki-entry-category mobile-only">{entry.category}</p>

                          {modificationTargetWikiIds.includes(entry.id) ? (
                            <span className="wiki-modification-badge modification-pending">
                              수정 요청 중
                            </span>
                          ) : (
                            ['PENDING', 'REJECTED'].includes(entry.modificationStatus) && (
                              <span className="wiki-modification-badge modification-pending">
                              수정 검토 중
                              </span>
                            )
                          )}

                          <p className="wiki-entry-category pc-only">{entry.category}</p>
                        </div>
                    </div>
                    <p className="wiki-entry-description">
                      {entry.description?.substring(0, 100)}
                      {entry.description?.length > 100 ? '...' : ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}