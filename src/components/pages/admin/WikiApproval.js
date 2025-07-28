import { useState, useEffect } from 'react';
import './WikiApproval.css';
import { axiosInstance } from '@utils/axios';
import NewEntryApproval from './WikiApprovalEntriesPage';
import ModificationApproval from './WikiApprovalModificationsPage';

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
        <NewEntryApproval
          pendingEntries={pendingEntries}
          selectedEntry={selectedEntry}
          entryDetail={entryDetail}
          onEntryClick={handleEntryClick}
          onApprove={handleApprove}
          onReject={handleReject}
          formatDate={formatDate}
        />
      ) : (
        <ModificationApproval
          pendingModifications={pendingModifications}
          selectedEntry={selectedEntry}
          comparisonData={comparisonData}
          onEntryClick={handleEntryClick}
          onApprove={handleModificationApprove}
          onReject={handleModificationReject}
          formatDate={formatDate}
        />
      )}
    </div>
  );
}