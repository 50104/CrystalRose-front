import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Link import 추가
import './WikiList.css';
import { axiosInstance } from '@utils/axios'; // axiosInstance 경로 확인 필요

export default function WikiListPage() {
  const [wikiEntries, setWikiEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWikiEntries();
  }, []);

  const fetchWikiEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      // API 엔드포인트는 실제 API에 맞게 수정해야 합니다.
      const response = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/v1/wiki/list`);
      setWikiEntries(response.data);
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
      <h1 className="wiki-list-title">장미 도감 목록</h1>
      
      {wikiEntries.length === 0 ? (
        <div className="wiki-list-no-entries">
          등록된 장미 도감이 없습니다.
        </div>
      ) : (
        <div className="wiki-entries-grid">
          {wikiEntries.map(entry => (
            <Link key={entry.id} to={`/wiki/${entry.id}`} className="wiki-entry-card-link">
              <div className="wiki-entry-card">
                {entry.imageUrl && (
                  <img src={entry.imageUrl} alt={entry.name} className="wiki-entry-image" />
                )}
                <div className="wiki-entry-content">
                  <h2 className="wiki-entry-name">{entry.name}</h2>
                  <p className="wiki-entry-category">{entry.category}</p>
                  <p className="wiki-entry-description">{entry.description?.substring(0, 100)}{entry.description?.length > 100 ? '...' : ''}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}