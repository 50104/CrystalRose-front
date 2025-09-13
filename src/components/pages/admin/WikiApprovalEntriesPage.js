import React, { useState } from 'react';
import './WikiApproval.css';
import './WikiApprovalEntries.css';

export default function NewEntryApproval({ 
  pendingEntries, 
  selectedEntry, 
  entryDetail,
  onEntryClick, 
  onApprove, 
  onReject, 
  formatDate 
}) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectInputForId, setShowRejectInputForId] = useState(null);

  const handleRejectClick = (entryId) => {
    if (showRejectInputForId === entryId) {
      setShowRejectInputForId(null);
      setRejectionReason('');
    } else {
      setShowRejectInputForId(entryId);
    }
  };

  const submitRejection = (entryId) => {
    if (!rejectionReason.trim()) {
      alert('거부 사유를 입력해주세요.');
      return;
    }
    onReject(entryId, rejectionReason);
    setShowRejectInputForId(null);
    setRejectionReason('');
  };
  
  const renderEntryDetail = (detail) => {
    if (!detail) return <p>상세 정보를 불러오는 중입니다</p>;

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
          <div className="entry-detail-row"><strong>생장습성:</strong> {detail.growthType || '없음'}</div>
          <div className="entry-detail-row"><strong>꽃잎 수:</strong> {detail.petalCount ?? '없음'}</div>
          <div className="entry-detail-row"><strong>꽃 크기:</strong> {detail.flowerSize || '없음'}</div>
          <div className="entry-detail-row"><strong>연속개화성:</strong> {detail.continuousBlooming || '없음'}</div>
          <div className="entry-detail-row"><strong>향기:</strong> {detail.fragrance || '없음'}</div>
          <div className="entry-detail-row"><strong>다화성:</strong> {detail.multiBlooming || '없음'}</div>
          <div className="entry-detail-row"><strong>수세:</strong> {detail.growthPower || '없음'}</div>
          <div className="entry-detail-row"><strong>내한성:</strong> {detail.coldResistance || '없음'}</div>
          <div className="entry-detail-row"><strong>내병성:</strong> {detail.diseaseResistance || '없음'}</div>
          <div className="entry-detail-row"><strong>사용 용도:</strong> {detail.usageType || '없음'}</div>
          <div className="entry-detail-row"><strong>추천 위치:</strong> {detail.recommendedPosition || '없음'}</div>
        </div>
      </div>
    );
  };

  return (
    <>
      <h2 className="pending-title">신규 등록 대기 중인 도감</h2>
      
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
              onClick={() => onEntryClick(entry)}
            >
              <div className="entry-header">
                <div className="entry-info">
                  <div className="entry-topline">
                    <h3 className="entry-name">{entry.name}</h3>
                    <span className="entry-date">{formatDate(entry.createdDate)}</span>
                  </div>
                </div>
                <div className="entry-actions">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onApprove(entry.id);
                    }}
                    className="approve-button"
                  >
                    등록 승인
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRejectClick(entry.id);
                    }}
                    className="reject-button"
                  >
                    등록 거부
                  </button>
                </div>
              </div>
              {showRejectInputForId === entry.id && (
                <div 
                  className="rejection-reason-box" 
                  onClick={(e) => e.stopPropagation()}
                >
                  <textarea 
                    placeholder="거부 사유를 입력해주세요"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                  <button 
                    className="submit-rejection-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      submitRejection(entry.id);
                    }}
                  >제출</button>
                </div>
              )}
              {selectedEntry?.id === entry.id && (
                <div className="entry-details">
                  {typeof entry.rejectionReason === 'string' && entry.rejectionReason.trim() !== '' && (
                    <>
                      <p>보완 사유</p>
                      <div className="reason-text">{entry.rejectionReason}</div>
                    </>
                  )}
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
  );
}