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
  const { isLogin } = GetUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLogin) return;

    axiosInstance.get('/api/roses/mine/wiki-ids')
      .then(res => setDisabledWikiIds(res.data))
      .catch(err => console.error('내 장미 도감 ID 목록 조회 실패', err));
    fetchWikiEntries();
  }, [isLogin]);

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
        <div className="wiki-list-loading-text">로딩 중...</div>
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
          {Array.isArray(wikiEntries) && wikiEntries.map(entry => (
            <div key={entry.id} className="wiki-entry-card-link" onClick={() => navigate(`/wiki/detail/${entry.id}`)}>
              <div className="wiki-entry-card">
                <div className="wiki-image-wrapper">
                  {entry.imageUrl && (
                    <img src={entry.imageUrl} alt={entry.name} className="wiki-entry-image" />
                  )}

                  {!disabledWikiIds.includes(entry.id) && (
                    <div style={{cursor: 'pointer'}}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/rose/register', {
                          state: {
                            roseData: {
                              wikiId: entry.id,
                              varietyName: entry.name,
                              imageUrl: ''
                            }
                          }
                        });
                      }}
                      className="wiki-register-overlay-button"
                    >
                      내 장미로 등록
                    </div>
                  )}
                  <div className="wiki-entry-content">
                    <div className="wiki-entry-header">
                    <h2 className="wiki-entry-name">{entry.name}</h2>
                      <div className="wiki-entry-name-row">
                        <p className="wiki-entry-category">{entry.category}</p>
                        {entry.modificationStatus === 'PENDING' && (
                          <span className="wiki-modification-badge modification-pending">수정 진행 중</span>
                        )}
                      </div>
                    </div>
                    <p className="wiki-entry-description">{entry.description?.substring(0, 100)}{entry.description?.length > 100 ? '...' : ''}</p>
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