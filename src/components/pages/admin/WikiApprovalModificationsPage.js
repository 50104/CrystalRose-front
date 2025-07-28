import React from 'react';
import './WikiApproval.css';
import './WikiApprovalModifications.css';

export default function ModificationApproval({ 
  pendingModifications, 
  selectedEntry, 
  comparisonData,
  onEntryClick, 
  onApprove, 
  onReject, 
  formatDate 
}) {
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

  return (
    <>
      <h2 className="pending-title">수정 대기 중인 도감</h2>
      
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
              onClick={() => onEntryClick(modification)}
            >
              <div className="entry-header">
                <div className="entry-info">
                  <h3 className="entry-name">{modification.name}</h3>
                  <span className="entry-date">{formatDate(modification.updatedDate || modification.createdDate)}</span>
                </div>
                <div className="entry-actions">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onApprove(modification.id);
                    }}
                    className="approve-button"
                  >
                    수정 승인
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onReject(modification.id);
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
  );
}