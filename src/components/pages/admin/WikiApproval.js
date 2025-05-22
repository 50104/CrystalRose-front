// AdminApprovalPage.jsx
import { useState, useEffect } from 'react';
import './WikiApproval.css';
import { axiosInstance } from '@utils/axios';

export default function WikiApprovalPage() {
  const [pendingEntries, setPendingEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    fetchPendingEntries();
  }, []);

  const fetchPendingEntries = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/v1/admin/wiki/pending`);
      setPendingEntries(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || '서버에서 데이터를 가져오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axiosInstance.patch(`${process.env.REACT_APP_API_URL}/api/v1/admin/wiki/${id}/approve`);
      setPendingEntries(pendingEntries.filter(entry => entry.id !== id));
      setMessage({ type: 'success', text: '도감이 승인되었습니다.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || '승인 중 오류가 발생했습니다.' });
    }
  };

  const handleReject = async (id) => {
    try {
      await axiosInstance.patch(`${process.env.REACT_APP_API_URL}/api/v1/admin/wiki/${id}/reject`);
      setPendingEntries(pendingEntries.filter(entry => entry.id !== id));
      setMessage({ type: 'success', text: '도감이 거부되었습니다.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || '거부 중 오류가 발생했습니다.' });
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

  const handleEntryClick = (entry) => {
    setSelectedEntry(selectedEntry?.id === entry.id ? null : entry);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>에러 발생: {error}</p>
        <button 
          onClick={fetchPendingEntries}
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
      
      <h2 className="pending-title">승인 대기 중인 도감 ({pendingEntries.length})</h2>
      
      {pendingEntries.length === 0 ? (
        <div className="no-entries">
          승인 대기 중인 도감이 없습니다.
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
                    <span className="entry-date">{formatDate(entry.createdDate)}</span>
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
                  <p>상세 정보를 조회하려면 API를 통해 추가 정보를 가져와야 합니다.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}