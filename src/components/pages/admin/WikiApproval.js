// AdminApprovalPage.jsx
import { useState, useEffect } from 'react';
import './WikiApproval.css';
import { axiosInstance } from '@utils/axios';

export default function WikiApprovalPage() {
  const [pendingEntries, setPendingEntries] = useState([]);
  const [pendingModifications, setPendingModifications] = useState([]);
  const [activeTab, setActiveTab] = useState('entries'); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [entryDetail, setEntryDetail] = useState(null);

  useEffect(() => {
    fetchPendingEntries();
    fetchPendingModifications();
  }, []);

  const fetchPendingEntries = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/v1/admin/wiki/pending`);
      setPendingEntries(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || '서버에서 데이터를 가져오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingModifications = async () => {
    try {
      const response = await axiosInstance.get(`/api/v1/admin/wiki/modifications/pending`);
      setPendingModifications(response.data);
    } catch (err) {
      console.error('수정 대기 목록 조회 실패:', err);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axiosInstance.patch(`/api/v1/admin/wiki/${id}/approve`);
      setPendingEntries(pendingEntries.filter(entry => entry.id !== id));
      setMessage({ type: 'success', text: '도감이 승인되었습니다.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || '승인 중 오류가 발생했습니다.' });
    }
  };

  const handleReject = async (id) => {
    try {
      await axiosInstance.patch(`/api/v1/admin/wiki/${id}/reject`);
      setPendingEntries(pendingEntries.filter(entry => entry.id !== id));
      setMessage({ type: 'success', text: '도감이 거부되었습니다.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || '거부 중 오류가 발생했습니다.' });
    }
  };

  const renderEntryDetail = (detail) => {
    if (!detail) return <p>상세 정보를 불러오는 중입니다...</p>;

    return (
      <div className="entry-detail-box">
        <div className="entry-detail-header">
          {detail.imageUrl && (
            <div className="entry-detail-image">
              <img src={detail.imageUrl} alt="도감 이미지" />
            </div>
          )}
          <div className="entry-detail-meta">
            <h3 className="entry-detail-title">{detail.name}</h3>
            <p className="entry-detail-category">{detail.category}</p>
          </div>
        </div>

        <div className="entry-detail-body">
          <div className="entry-detail-row"><strong>품종 코드:</strong> {detail.cultivarCode || '없음'}</div>
          <div className="entry-detail-row"><strong>꽃 크기:</strong> {detail.flowerSize || '없음'}</div>
          <div className="entry-detail-row"><strong>꽃잎 수:</strong> {detail.petalCount ?? '없음'}</div>
          <div className="entry-detail-row"><strong>향기:</strong> {detail.fragrance || '없음'}</div>
          <div className="entry-detail-row"><strong>내병성:</strong> {detail.diseaseResistance || '없음'}</div>
          <div className="entry-detail-row"><strong>내한성:</strong> {detail.coldResistance || '없음'}</div>
          <div className="entry-detail-row"><strong>생장형태:</strong> {detail.growthType || '없음'}</div>
          <div className="entry-detail-row"><strong>사용 용도:</strong> {detail.usageType || '없음'}</div>
          <div className="entry-detail-row"><strong>추천 위치:</strong> {detail.recommendedPosition || '없음'}</div>
          <div className="entry-detail-row"><strong>연속개화성:</strong> {detail.continuousBlooming || '없음'}</div>
          <div className="entry-detail-row"><strong>다화성:</strong> {detail.multiBlooming || '없음'}</div>
          <div className="entry-detail-row"><strong>수세:</strong> {detail.growthPower || '없음'}</div>
        </div>
      </div>
    );
  };

  const handleModificationApprove = async (id) => {
    try {
      await axiosInstance.patch(`/api/v1/admin/wiki/modifications/${id}/approve`);
      setPendingModifications(pendingModifications.filter(modification => modification.id !== id));
      setMessage({ type: 'success', text: '도감 수정이 승인되었습니다.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || '수정 승인 중 오류가 발생했습니다.' });
    }
  };

  const handleModificationReject = async (id) => {
    try {
      await axiosInstance.patch(`/api/v1/admin/wiki/modifications/${id}/reject`);
      setPendingModifications(pendingModifications.filter(modification => modification.id !== id));
      setMessage({ type: 'success', text: '도감 수정이 거부되었습니다.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || '수정 거부 중 오류가 발생했습니다.' });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleEntryClick = async (entry) => {
    if (selectedEntry?.id === entry.id) {
      setSelectedEntry(null);
      setComparisonData(null);
      setEntryDetail(null);
    } else {
      setSelectedEntry(entry);
      if (activeTab === 'modifications') {
        try {
          const response = await axiosInstance.get(`/api/v1/admin/wiki/${entry.id}/original`);
          setComparisonData(response.data);
        } catch (err) {
          console.error('비교 데이터 조회 실패:', err);
          setComparisonData(null);
        }
      } else {
        try {
          const response = await axiosInstance.get(`/api/v1/admin/wiki/detail/${entry.id}`);
          setEntryDetail(response.data);
        } catch (err) {
          console.error('도감 상세 조회 실패:', err);
          setEntryDetail(null);
        }
      }
    }
  };

  // 필드 변경 사항을 감지하는 함수 (백엔드 응답 구조에 맞게 수정)
  const getFieldChanges = (comparisonData) => {
    if (!comparisonData || !comparisonData.originalData || !comparisonData.modifiedData) return {};
    
    const changes = {};
    const fields = [
      { key: 'name', label: '품종명' },
      { key: 'category', label: '카테고리' },
      { key: 'cultivarCode', label: '품종코드' },
      { key: 'flowerSize', label: '꽃 크기' },
      { key: 'petalCount', label: '꽃잎 수' },
      { key: 'fragrance', label: '향기' },
      { key: 'diseaseResistance', label: '내병성' },
      { key: 'coldResistance', label: '내한성' },
      { key: 'growthType', label: '생장형태' },
      { key: 'usageType', label: '사용 용도' },
      { key: 'recommendedPosition', label: '추천 위치' },
      { key: 'continuousBlooming', label: '연속개화성' },
      { key: 'multiBlooming', label: '다화성' },
      { key: 'growthPower', label: '수세' },
      { key: 'imageUrl', label: '이미지' }
    ];
    
    const original = comparisonData.originalData;
    const modified = comparisonData.modifiedData;
    
    fields.forEach(field => {
      const originalValue = original[field.key] || '';
      const currentValue = modified[field.key] || '';
      
      if (originalValue !== currentValue) {
        changes[field.key] = {
          label: field.label,
          original: originalValue,
          current: currentValue
        };
      }
    });
    
    return changes;
  };

  // 변경 사항을 렌더링하는 컴포넌트
  const renderChanges = (comparisonData) => {
    const changes = getFieldChanges(comparisonData);
    const changeKeys = Object.keys(changes);
    
    if (changeKeys.length === 0) {
      return <p>변경된 내용이 없습니다.</p>;
    }
    
    return (
      <div className="changes-list">
        <div className="changes-summary">
          <p><strong>변경된 필드 수:</strong> {changeKeys.length}개</p>
          <p><strong>요청자:</strong> {comparisonData.requesterNick}</p>
          {comparisonData.description && (
            <div className="modification-reason">
              <p><strong>수정 사유:</strong></p>
              <div className="reason-text">{comparisonData.description}</div>
            </div>
          )}
        </div>
        {changeKeys.map(key => (
          <div key={key} className="change-item">
            <div className="change-field-label">{changes[key].label}</div>
            <div className="change-comparison">
              <div className="change-before">
                <span className="change-label">변경 전:</span>
                <span className="change-value original">
                  {changes[key].original || <em>없음</em>}
                </span>
              </div>
              <div className="change-after">
                <span className="change-label">변경 후:</span>
                <span className="change-value modified">
                  {changes[key].current || <em>없음</em>}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">불러오는 중</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>에러 발생: {error}</p>
        <button 
          onClick={() => {
            fetchPendingEntries();
            fetchPendingModifications();
          }}
          className="retry-button"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <h1 className="admin-title">장미 도감 관리자 페이지</h1>
      
      {message && (
        <div className={`admin-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="tab-menu">
        <button 
          className={`tab-button ${activeTab === 'entries' ? 'active' : ''}`}
          onClick={() => setActiveTab('entries')}
        >
          신규 등록 승인 ({pendingEntries.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'modifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('modifications')}
        >
          수정 승인 ({pendingModifications.length})
        </button>
      </div>

      {activeTab === 'entries' ? (
        <>
          <h2 className="pending-title">신규 등록 대기 중인 도감 ({pendingEntries.length})</h2>
          
          {pendingEntries.length === 0 ? (
            <div className="no-entries">
              신규 등록 대기 중인 도감이 없습니다.
            </div>
          ) : (
            <div className="entries-list">
              {pendingEntries.map(entry => (
                <div 
                  key={entry.id} 
                  className={`entry-card ${selectedEntry?.id === entry.id ? 'selected' : ''}`}
                  onClick={() => handleEntryClick(entry)}
                >
                  <div className="entry-header">
                    <div className="entry-info">
                      <h3 className="entry-name">{entry.name}</h3>
                      <div className="entry-meta">
                        <span className="entry-category">{entry.category}</span>
                        <div className="entry-date-container">
                          <span className="entry-date">{formatDate(entry.createdDate)}</span>
                        </div>
                        <span className="new-entry-badge">신규 등록</span>
                      </div>
                    </div>
                    <div className="entry-actions">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprove(entry.id);
                        }}
                        className="approve-button"
                      >
                        승인
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReject(entry.id);
                        }}
                        className="reject-button"
                      >
                        거부
                      </button>
                    </div>
                  </div>
                  {selectedEntry?.id === entry.id && (
                    <div className="entry-details">
                      {entryDetail ? (
                        renderEntryDetail(entryDetail)
                      ) : (
                        <p>상세 정보 불러오는 중</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <h2 className="pending-title">수정 대기 중인 도감 ({pendingModifications.length})</h2>
          
          {pendingModifications.length === 0 ? (
            <div className="no-entries">
              수정 대기 중인 도감이 없습니다.
            </div>
          ) : (
            <div className="entries-list">
              {pendingModifications.map(modification => (
                <div 
                  key={modification.id} 
                  className={`entry-card ${selectedEntry?.id === modification.id ? 'selected' : ''}`}
                  onClick={() => handleEntryClick(modification)}
                >
                  <div className="entry-header">
                    <div className="entry-info">
                      <h3 className="entry-name">{modification.name}</h3>
                      <div className="entry-meta">
                        <span className="entry-category">{modification.category}</span>
                        <span className="entry-date">{formatDate(modification.updatedDate || modification.createdDate)}</span>
                      </div>
                    </div>
                    <div className="entry-actions">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleModificationApprove(modification.id);
                        }}
                        className="approve-button"
                      >
                        수정 승인
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleModificationReject(modification.id);
                        }}
                        className="reject-button"
                      >
                        수정 거부
                      </button>
                    </div>
                  </div>
                  
                  {selectedEntry?.id === modification.id && (
                    <div className="entry-details">
                      <div className="modification-details">
                        <div className="modification-info">
                          
                          <h4>변경 사항</h4>
                          {comparisonData ? (
                            renderChanges(comparisonData)
                          ) : (
                            <div className="loading-changes">
                              변경 사항을 불러오는 중
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}