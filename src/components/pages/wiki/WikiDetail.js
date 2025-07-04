import { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import './WikiDetail.css';
import { axiosInstance } from '@utils/axios';

export default function WikiDetailPage() {
  const { wikiId } = useParams();
  const [wikiEntry, setWikiEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getProgressValue = (value) => {
    if (!value) return 0;
    
    const valueStr = value.toString().toLowerCase();
    
    // 숫자가 포함된 경우 (예: "3", "4단계" 등)
    const numberMatch = valueStr.match(/(\d+)/);
    if (numberMatch) {
      const num = parseInt(numberMatch[1]);
      return Math.min(num * 20, 100); // 1-5 스케일을 20-100%로 변환
    }
    
    const progressMap = {
      // 강도 관련
      '매우 강함': 100,
      '강함': 80,
      '보통': 60,
      '약함': 40,
      '매우 약함': 20,
      
      // 크기 관련
      '대형': 100,
      '중대형': 80,
      '중형': 60,
      '소형': 40,
      '극소형': 20,
      
      // 향기 관련
      '매우 강한 향': 100,
      '강한 향': 80,
      '중간 향': 60,
      '약한 향': 40,
      '무향': 20,
      
      // 일반적인 좋음/나쁨
      '우수': 100,
      '양호': 80,
      '부족': 40,
      '미흡': 20,
      
      // 기본값
      '있음': 80,
      '없음': 20,
      '높음': 80,
      '낮음': 40,
    };
    
    // 부분 매칭 확인
    for (const [key, val] of Object.entries(progressMap)) {
      if (valueStr.includes(key)) {
        return val;
      }
    }
    
    // 기본값
    return 60;
  };

  useEffect(() => {
    const fetchWikiEntryDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get(`/api/v1/wiki/detail/${wikiId}`);
        setWikiEntry(response.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || '데이터를 불러오는 데 실패했습니다.');
        console.error(`Error fetching wiki entry ${wikiId}:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchWikiEntryDetail();
  }, [wikiId]);

  const retryFetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/api/v1/wiki/detail/${wikiId}`);
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
        <button onClick={retryFetch} className="wiki-detail-retry-button">
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
      <div className="wiki-detail-navigation">
        <RouterLink to="/wiki/list" className="wiki-detail-back-button">
          &larr; 목록으로 돌아가기
        </RouterLink>
        <RouterLink to={`/wiki/edit/${wikiId}`} className="wiki-detail-edit-button">
          수정하기
        </RouterLink>
      </div>
      
      <div className="wiki-detail-header">
        <h1 className="wiki-detail-title">{wikiEntry.name}</h1>
        <div className="wiki-detail-header-info">
          <span className="wiki-detail-category">{wikiEntry.category}</span>
          {wikiEntry.cultivarCode && (
            <span className="wiki-detail-cultivar-code">{wikiEntry.cultivarCode}</span>
          )}
          {wikiEntry.modificationStatus === 'PENDING' && (
            <span className="wiki-detail-modification-badge modification-pending">수정 진행 중</span>
          )}
        </div>
      </div>
      
      <div className="wiki-detail-content-wrapper">
        <div className="wiki-detail-left-section">
          {wikiEntry.imageUrl && (
            <img src={wikiEntry.imageUrl} alt={wikiEntry.name} className="wiki-detail-image" />
          )}
          <div className="wiki-detail-image-info">
            {wikiEntry.petalCount && (
              <div className="wiki-detail-info-item">
                <strong>꽃잎 수:</strong> <span>{wikiEntry.petalCount}</span>
              </div>
            )}
            {wikiEntry.growthType && (
              <div className="wiki-detail-info-item">
                <strong>생장형태:</strong> <span>{wikiEntry.growthType}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="wiki-detail-right-section">
          {wikiEntry.description && (
            <p className="wiki-detail-description">{wikiEntry.description}</p>
          )}
          
          <div className="wiki-detail-specs">
            <div className="wiki-detail-progress-section">
              {wikiEntry.fragrance && (
                <div className="wiki-detail-progress-item">
                  <div className="progress-label">향기</div>
                  <div className="progress-container">
                    <div 
                      className="progress-bar" 
                      style={{
                        '--target-width': `${getProgressValue(wikiEntry.fragrance)}%`,
                        animationDelay: '0.3s'
                      }}
                    ></div>
                  </div>
                  <div className="progress-value">{wikiEntry.fragrance}</div>
                </div>
              )}
              
              {wikiEntry.growthPower && (
                <div className="wiki-detail-progress-item">
                  <div className="progress-label">수세</div>
                  <div className="progress-container">
                    <div 
                      className="progress-bar" 
                      style={{
                        '--target-width': `${getProgressValue(wikiEntry.growthPower)}%`,
                        animationDelay: '0.5s'
                      }}
                    ></div>
                  </div>
                  <div className="progress-value">{wikiEntry.growthPower}</div>
                </div>
              )}
              
              {wikiEntry.diseaseResistance && (
                <div className="wiki-detail-progress-item">
                  <div className="progress-label">내병성</div>
                  <div className="progress-container">
                    <div 
                      className="progress-bar" 
                      style={{
                        '--target-width': `${getProgressValue(wikiEntry.diseaseResistance)}%`,
                        animationDelay: '0.2s'
                      }}
                    ></div>
                  </div>
                  <div className="progress-value">{wikiEntry.diseaseResistance}</div>
                </div>
              )}
              
              {wikiEntry.coldResistance && (
                <div className="wiki-detail-progress-item">
                  <div className="progress-label">내한성</div>
                  <div className="progress-container">
                    <div 
                      className="progress-bar" 
                      style={{
                        '--target-width': `${getProgressValue(wikiEntry.coldResistance)}%`,
                        animationDelay: '0.4s'
                      }}
                    ></div>
                  </div>
                  <div className="progress-value">{wikiEntry.coldResistance}</div>
                </div>
              )}
              
              {wikiEntry.multiBlooming && (
                <div className="wiki-detail-progress-item">
                  <div className="progress-label">다화성</div>
                  <div className="progress-container">
                    <div 
                      className="progress-bar" 
                      style={{
                        '--target-width': `${getProgressValue(wikiEntry.multiBlooming)}%`,
                        animationDelay: '0.7s'
                      }}
                    ></div>
                  </div>
                  <div className="progress-value">{wikiEntry.multiBlooming}</div>
                </div>
              )}
              
              {wikiEntry.flowerSize && (
                <div className="wiki-detail-progress-item">
                  <div className="progress-label">꽃 크기</div>
                  <div className="progress-container">
                    <div 
                      className="progress-bar" 
                      style={{
                        '--target-width': `${getProgressValue(wikiEntry.flowerSize)}%`,
                        animationDelay: '0.1s'
                      }}
                    ></div>
                  </div>
                  <div className="progress-value">{wikiEntry.flowerSize}</div>
                </div>
              )}
              
              {wikiEntry.continuousBlooming && (
                <div className="wiki-detail-progress-item">
                  <div className="progress-label">연속개화성</div>
                  <div className="progress-container">
                    <div 
                      className="progress-bar" 
                      style={{
                        '--target-width': `${getProgressValue(wikiEntry.continuousBlooming)}%`,
                        animationDelay: '0.6s'
                      }}
                    ></div>
                  </div>
                  <div className="progress-value">{wikiEntry.continuousBlooming}</div>
                </div>
              )}
            </div>

            <div className="wiki-detail-bottom-info">
              {wikiEntry.usageType && (
                <div className="wiki-detail-info-item">
                  <strong>사용 용도:</strong> <span>{wikiEntry.usageType}</span>
                </div>
              )}
              {wikiEntry.recommendedPosition && (
                <div className="wiki-detail-info-item">
                  <strong>추천 위치:</strong> <span>{wikiEntry.recommendedPosition}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}