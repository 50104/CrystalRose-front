import React, { useState } from "react";

const ReportModal = ({ visible, onClose, onSubmit, targetId }) => {
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

  return (
    <div className="reportModal">
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="신고 사유를 입력하세요"
      />
      <button onClick={handleSubmit}>제출</button>
      <button onClick={onClose}>취소</button>
    </div>
  );
};

export default ReportModal;
