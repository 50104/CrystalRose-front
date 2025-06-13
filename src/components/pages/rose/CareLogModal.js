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

export default function CareLogModal({ log, onClose }) {
  const entries = Object.entries(log).filter(([key, value]) =>
    CARE_LABELS[key] && value && value !== '없음'
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h2>{log.careDate} 관리기록</h2>
        <ul>
          {entries.map(([key, value]) => (
            <li key={key}><b>{CARE_LABELS[key]}</b>: {value}</li>
          ))}
        </ul>
        <button onClick={onClose}>닫기</button>
      </div>
    </div>
  );
}
