import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '@utils/axios';
import './MyRejectedModificationsPage.css';

export default function RejectedModificationList() {
  const [rejectedList, setRejectedList] = useState([]);
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchModifications = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get('/api/v1/wiki/user/modification/list');
        const data = res.data;

        setPendingList(data.filter(item => item.status === 'PENDING'));
        setRejectedList(data.filter(item => item.status === 'REJECTED'));
      } catch (err) {
        console.error('불러오기 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchModifications();
  }, []);

  const goToResubmitPage = (id) => {
    navigate(`/wiki/resubmit/${id}`);
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

  if (loading) {
    return (
      <div className="rejected-modification-container">
        <p>도감 수정 요청을 불러오는 중</p>
      </div>
    );
  }

  return (
    <div className="my-modifications-container">
      {/* REJECTED 목록 */}
      <section className="modification-section">
        <h2 className="pending-title">거절된 도감 수정 목록</h2>

        {rejectedList.length === 0 ? (
          <div className="no-entries">거절된 목록이 없습니다.</div>
        ) : (
          <div className="entries-list">
            {rejectedList.map((item) => (
              <div key={item.id} className="entry-card">
                <div className="entry-header">
                  <div className="entry-info">
                    <h3 className="entry-name">{item.name}</h3>
                    <span className="entry-date">{formatDate(item.createdDate)}</span>
                  </div>
                  <div className="entry-actions">
                    <button 
                      onClick={() => goToResubmitPage(item.id)}
                      className="approve-button"
                    >
                      보완 제출
                    </button>
                  </div>
                </div>

                <div className="entry-details">
                  <div className="modification-details">
                    <p>거절 사유</p>
                    <div className="reason-text">{item.description || '사유가 제공되지 않았습니다.'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* PENDING 목록 */}
      <section className="modification-section">
        <h2 className="pending-title">제출된 도감 수정 목록</h2>

        {pendingList.length === 0 ? (
          <div className="no-entries">제출된 수정이 없습니다.</div>
        ) : (
          <div className="entries-list">
            {pendingList.map((item) => (
              <div key={item.id} className="entry-card">
                <div className="entry-header">
                  <div className="entry-info">
                    <h3 className="entry-name">{item.name}</h3>
                    <span className="entry-date">{formatDate(item.createdDate)}</span>
                  </div>
                </div>

                <div className="entry-details">
                  <div className="modification-details">
                    <p>제출 사유</p>
                    <div className="reason-text">{item.description || '사유가 제공되지 않았습니다.'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
