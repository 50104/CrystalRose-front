import { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import './WikiDetail.css';
import { axiosInstance } from '@utils/axios';

export default function WikiDetailPage() {
  const { wikiId } = useParams();
  const [wikiEntry, setWikiEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWikiEntryDetail();
  }, [wikiId]);

  const fetchWikiEntryDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/v1/wiki/${wikiId}`);
      setWikiEntry(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || '데이터를 불러오는 데 실패했습니다.');
      console.error(`Error fetching wiki entry ${wikiId}:`, err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="wiki-detail-loading-container">
        <div className="wiki-detail-loading-text">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wiki-detail-error-container">
        <p>오류: {error}</p>
        <button onClick={fetchWikiEntryDetail} className="wiki-detail-retry-button">
          다시 시도
        </button>
        <RouterLink to="/wiki" className="wiki-detail-back-button">
          목록으로 돌아가기
        </RouterLink>
      </div>
    );
  }

  if (!wikiEntry) {
    return (
      <div className="wiki-detail-no-entry">
        해당 장미 도감 정보를 찾을 수 없습니다.
        <RouterLink to="/wiki" className="wiki-detail-back-button">
          목록으로 돌아가기
        </RouterLink>
      </div>
    );
  }

  return (
    <div className="wiki-detail-container">
      <RouterLink to="/wiki/list" className="wiki-detail-back-button">
        &larr; 목록으로 돌아가기
      </RouterLink>
      <h1 className="wiki-detail-title">{wikiEntry.name}</h1>
      
      <div className="wiki-detail-content-wrapper">
        {wikiEntry.imageUrl && (
          <img src={wikiEntry.imageUrl} alt={wikiEntry.name} className="wiki-detail-image" />
        )}
        <div className="wiki-detail-info">
          <p className="wiki-detail-category">{wikiEntry.category}</p>
          <p className="wiki-detail-description">{wikiEntry.description}</p>
          {/* 추가정보보 */}
        </div>
      </div>
    </div>
  );
}