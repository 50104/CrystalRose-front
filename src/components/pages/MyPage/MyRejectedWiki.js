import { useEffect, useState } from 'react';
import { axiosInstance } from '@utils/axios';
import MyRejectedWikisList from './MyRejectedWikisList';
import RejectedModificationList from './MyRejectedModificationsPage';
import './MyRejectedModificationsPage.css';

export default function MyRejectedWiki() {
  const [activeTab, setActiveTab] = useState('wikis');
  const [rejectedWikis, setRejectedWikis] = useState([]);
  const [pendingWikis, setPendingWikis] = useState([]);
  const [loadingWikis, setLoadingWikis] = useState(true);

  useEffect(() => {
    if (activeTab === 'wikis') {
      fetchWikiLists();
    }
  }, [activeTab]);

  const fetchWikiLists = async () => {
    try {
      setLoadingWikis(true);
      // 거절된 도감
      const rejectedRes = await axiosInstance.get('/api/v1/wiki/user/rejected');
      setRejectedWikis(rejectedRes.data.content || []);
      // 제출된 도감
      const pendingRes = await axiosInstance.get('/api/v1/wiki/user/list', {
        params: { status: 'PENDING' }
      });
      setPendingWikis((pendingRes.data.content || []).filter(item => item.status === 'PENDING'));
    } catch (err) {
      setRejectedWikis([]);
      setPendingWikis([]);
    } finally {
      setLoadingWikis(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="admin-container">
      <h1 className="admin-title">내 제출 목록</h1>
      <div className="tab-menu">
        <button
          className={`tab-button ${activeTab === 'wikis' ? 'active' : ''}`}
          onClick={() => setActiveTab('wikis')}
        >
          도감 등록
        </button>

        <button
          className={`tab-button ${activeTab === 'modifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('modifications')}
        >
          도감 수정
        </button>
      </div>
      {activeTab === 'wikis' ? (
        <MyRejectedWikisList
          rejectedList={rejectedWikis}
          pendingList={pendingWikis}
          loading={loadingWikis}
          formatDate={formatDate}
        />
      ) : (
        <RejectedModificationList />
      )}
    </div>
  );
}
