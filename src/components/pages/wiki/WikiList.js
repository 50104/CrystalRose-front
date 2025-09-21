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
  const [showUnregisteredOnly, setShowUnregisteredOnly] = useState(false);
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);
  const [wishlistIds, setWishlistIds] = useState([]);
  const { isLogin } = GetUser();
  const navigate = useNavigate();

  const SCROLL_POSITION_KEY = 'wikiListScrollPosition'; // 스크롤 위치 저장 키

  useEffect(() => {
    const fetchMyWikiIds = async () => {
      try {
        const res = await axiosInstance.get('/api/roses/mine/wiki-ids');
        setDisabledWikiIds(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          return;
        }
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
        if (err.response?.status === 401) {
          return;
        }
        console.error('도감 수정 요청 목록 조회 실패', err);
      }
    };

    const fetchUserWishlist = async () => {
      try {
        const res = await axiosInstance.get('/api/v1/wiki/wishlist');
        const wishlistWikiIds = res.data.map(item => item.wikiId);
        setWishlistIds(wishlistWikiIds);
      } catch (err) {
        if (err.response?.status === 401) {
          return;
        }
        console.error('위시리스트 조회 실패', err);
      }
    };

    const init = async () => {
      if (isLogin) {
        await fetchMyWikiIds();
        await fetchModificationTargets();
        await fetchUserWishlist();
      }
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

  const handleWishlistToggle = async (e, wikiId) => {
    e.stopPropagation();
    
    if (!isLogin) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const isInWishlist = wishlistIds.includes(wikiId);
      
      if (isInWishlist) { // 위시 제거
        await axiosInstance.delete(`/api/v1/wiki/wishlist/${wikiId}`);
        setWishlistIds(prev => prev.filter(id => id !== wikiId));
      } else { // 위시 추가
        await axiosInstance.post('/api/v1/wiki/wishlist', { wikiId });
        setWishlistIds(prev => [...prev, wikiId]);
      }
    } catch (err) {
      console.error('위시리스트 토글 실패', err);
      alert('위시리스트 처리에 실패했습니다.');
    }
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

  const filteredWikiEntries = wikiEntries.filter(entry => {
    if (!isLogin) return true;
    
    if (showUnregisteredOnly) { // 등록 가능한 장미
      const isRegistered = disabledWikiIds.includes(entry.id);
      if (isRegistered) return false;
    }
    
    if (showWishlistOnly) { // 위시리스트
      const isInWishlist = wishlistIds.includes(entry.id);
      if (!isInWishlist) return false;
    }
    
    return true;
  });

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
        <div className="wiki-header-controls">
          {isLogin && (
            <div className="wiki-filter-controls">
              <div className="wiki-filter-star">
                <div 
                  className={`filter-star ${showUnregisteredOnly ? 'active' : ''}`}
                  onClick={() => setShowUnregisteredOnly(!showUnregisteredOnly)}
                  title={showUnregisteredOnly ? '모든 장미 보기' : '등록 가능한 장미만 보기'}
                >
                  🌹
                </div>
                <span className="filter-label">등록 가능</span>
              </div>
              <div className="wiki-filter-star">
                <div 
                  className={`filter-star ${showWishlistOnly ? 'active' : ''}`}
                  onClick={() => setShowWishlistOnly(!showWishlistOnly)}
                  title={showWishlistOnly ? '모든 장미 보기' : '위시리스트 장미만 보기'}
                >
                  ★
                </div>
                <span className="filter-label">위시리스트</span>
              </div>
            </div>
          )}
          <div onClick={() => navigate('/wiki/register')} className="wiki-register-button">
            + 도감 등록
          </div>
        </div>
      </div>
      
      {filteredWikiEntries.length === 0 ? (
        <div className="wiki-list-no-entries">
          {isLogin 
            ? (() => {
                if (showUnregisteredOnly && showWishlistOnly) {
                  return '등록 가능하고 위시리스트에 있는 장미 도감이 없습니다.';
                } else if (showUnregisteredOnly) {
                  return '등록 가능한 장미 도감이 없습니다.';
                } else if (showWishlistOnly) {
                  return '위시리스트에 있는 장미 도감이 없습니다.';
                } else {
                  return '등록된 장미 도감이 없습니다.';
                }
              })()
            : '등록된 장미 도감이 없습니다.'
          }
        </div>
      ) : (
        <div className="wiki-entries-grid">
          {filteredWikiEntries.map(entry => (
            <div key={entry.id} className="wiki-entry-card-link" onClick={() => handleDetailNavigation(entry.id)}>
              <div className="wiki-entry-card">
                <div className="wiki-image-wrapper">
                  {entry.imageUrl && (
                    <img src={entry.imageUrl} alt={entry.name} className="wiki-entry-image" />
                  )}
                  {isLogin && (
                    <div
                      className={`wishlist-star ${wishlistIds.includes(entry.id) ? 'active' : ''}`}
                      onClick={(e) => handleWishlistToggle(e, entry.id)}
                      title={wishlistIds.includes(entry.id) ? '위시리스트에서 제거' : '위시리스트에 추가'}
                    >
                      ★
                    </div>
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