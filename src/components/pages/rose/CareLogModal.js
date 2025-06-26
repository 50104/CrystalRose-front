import React from 'react';
import './CareLogModal.css';

const CARE_LABELS = {
  fertilizer: '영양제',
  pesticide: '살충제',
  adjuvant: '보조제',
  compost: '비료',
  fungicide: '살균제',
  note: '메모'
};

export default function CareLogModal({ log, onClose, onEdit }) {
  const entries = Object.entries(log).filter(([key, value]) =>
    CARE_LABELS[key] && value && value !== '없음'
  );

  const displayDate = new Date(log.careDate + 'T00:00:00');

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h2>{displayDate.toLocaleDateString('ko-KR', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })} 관리 기록</h2>
        {entries.length > 0 ? (
          <ul>
            {entries.map(([key, value]) => (
              <li key={key}>
                <b>{CARE_LABELS[key]}</b> {value}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ textAlign: 'center', color: '#6b7280', margin: '2rem 0' }}>
            등록된 관리 내용이 없습니다.
          </p>
        )}
        <div className="modal-buttons">
          {onEdit && <button onClick={onEdit} className="edit-button">수정</button>}
          <button onClick={onClose} className="close-button">닫기</button>
        </div>
      </div>
    </div>
  );
}
