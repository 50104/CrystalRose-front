import React, { useState } from 'react';
import CareLogRegister from './CareLogRegister';
import './CareLogModal.css';

const CARE_LABELS = {
  watering: '💧 관수',
  fertilizer: '💊 영양제',
  pesticide: '🪰 살충제',
  adjuvant: '🧪 보조제',
  fungicide: '🧼 살균제',
  compost: '💩 비료',
  note: '📝 메모'
};

export default function CareLogModal({ log, onClose, onEdit }) {
  const [editing, setEditing] = useState(false); // 수정 모드
  const CARE_ORDER = [
    'watering',
    'fertilizer',
    'pesticide',
    'adjuvant',
    'fungicide',
    'compost',
    'note'
  ];

  const entries = CARE_ORDER
    .filter(key => log?.[key] != null && log[key] !== '')
    .map(key => [key, log[key]]);

  const displayDate = new Date(log.careDate + 'T00:00:00');

  const handleSuccess = () => {
    setEditing(false);
    onEdit?.();
  };

  if (editing) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-box" onClick={e => e.stopPropagation()}>
          <CareLogRegister
            selectedDate={new Date(log.careDate)}
            editData={log}
            onSuccess={handleSuccess}
            onCancel={() => setEditing(false)}
          />
        </div>
      </div>
    );
  }

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
          <button onClick={() => setEditing(true)} className="edit-button">수정</button>
          <button onClick={onClose} className="close-button">닫기</button>
        </div>
      </div>
    </div>
  );
}
