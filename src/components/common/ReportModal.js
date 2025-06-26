import React, { useState } from "react";

const ReportModal = ({ visible, onClose, onSubmit, targetId, title = "신고" }) => {
  const [reason, setReason] = useState("");

  if (!visible) return null;

  const handleSubmit = () => {
    if (!reason.trim()) {
      alert("신고 사유를 입력하세요");
      return;
    }
    onSubmit(targetId, reason);
    setReason("");
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      <div className="reportModal" onClick={handleBackdropClick}>
        <div className="reportModalContent" onClick={(e) => e.stopPropagation()}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>{title}</h3>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="신고 사유를 입력하세요"
            autoFocus
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={onClose}>취소</button>
            <button onClick={handleSubmit}>제출</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReportModal;
