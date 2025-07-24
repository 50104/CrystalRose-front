// RoseListPage.js 전체 개선
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './RoseListPage.css';
import { axiosInstance } from '@utils/axios';

export default function RoseListPage() {
  const [roses, setRoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyRoses();
  }, []);

  const fetchMyRoses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/api/roses/list`);
      
      if (response.data && Array.isArray(response.data)) {
        setRoses(response.data);
      } else {
        console.warn('예상과 다른 응답 형식:', response.data);
        setRoses([]);
      }
    } catch (err) {
      console.error('Error fetching my roses:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.message || err.message || '데이터를 불러오는 데 실패했습니다.');
      setRoses([]); // 에러 시 빈 배열로 초기화
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '날짜 정보 없음';
    try {
      return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      console.error('날짜 포맷 오류:', e);
      return '날짜 형식 오류';
    }
  };

  if (loading) {
    return (
      <div className="rose-list-loading-container">
        <div className="rose-list-loading-text">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rose-list-error-container">
        <p>오류: {error}</p>
        <button onClick={fetchMyRoses} className="rose-list-retry-button">
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="rose-list-container">
      <div className="rose-list-header">
        <h1 className="rose-list-title">내 장미 목록</h1>
        <div className="rose-list-buttons">
          <Link to="/diaries/list" className="rose-diary-button">
            성장기록
          </Link>
          <Link to="/rose/register" className="rose-register-button">
            + 장미 등록
          </Link>
        </div>
      </div>

      {!roses || roses.length === 0 ? (
        <div className="rose-list-no-entries">
          등록된 장미가 없습니다.
          <br />
          <Link to="/rose/register" className="rose-entry-action-link" style={{ marginTop: '1rem', display: 'inline-block' }}>
            첫 번째 장미 등록하기
          </Link>
        </div>
      ) : (
        <div className="rose-entries-grid">
          {roses.map(rose => (
            <div key={rose.id} className="rose-entry-card">
              <div className="rose-image-wrapper">
                {rose.imageUrl && (
                  <img 
                    src={rose.imageUrl} 
                    alt={rose.nickname || '장미'} 
                    className="rose-entry-image" 
                  />
                )}
                <Link 
                  to="/rose/register"
                  state={{ roseData: rose,
                            wikiId: rose.wikiId,
                            varietyName: rose.varietyName }} 
                  className="rose-edit-button"
                >
                  수정
                </Link>
              </div>
              <div className="rose-entry-content">
                <div className="rose-entry-details">
                  <h2 className="rose-entry-nickname">{rose.nickname || '이름 없음'}</h2>
                  <p className="rose-entry-variety">{rose.varietyName || '품종 정보 없음'}</p>
                </div>
                
                <div className="rose-entry-acquired-date">
                  입양일 : {formatDate(rose.acquiredDate)}
                </div>
                
                {rose.locationNote && (
                  <div className="rose-entry-location">
                    메모 : {rose.locationNote}
                  </div>
                )}
                
                <div className="rose-entry-actions">
                  <Link 
                    to={`/diaries/register/${rose.id}`} 
                    className="rose-entry-action-link"
                  >
                    + 기록 추가
                  </Link>
                  <div className="rose-entry-actions-row">
                    <Link 
                      to={`/diaries/${rose.id}/timeline`} 
                      state={{ nickname: rose.nickname }}
                      className="rose-entry-action-link secondary"
                    >
                      타임라인
                    </Link>
                    <Link 
                      to={`/diaries/${rose.id}/timelapse`} 
                      state={{ nickname: rose.nickname }}
                      className="rose-entry-action-link secondary"
                    >
                      타임랩스
                    </Link>
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