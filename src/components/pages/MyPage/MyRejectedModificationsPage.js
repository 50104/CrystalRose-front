
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '@utils/axios';
import './MyRejectedModificationsPage.css';

export default function RejectedModificationList() {
  const [rejectedList, setRejectedList] = useState([]);
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPending, setSelectedPending] = useState(null);
  const [pendingDetail, setPendingDetail] = useState(null);
  const [selectedRejected, setSelectedRejected] = useState(null);
  const [rejectedDetail, setRejectedDetail] = useState(null);
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

  const renderEntryDetail = (detail) => {
    if (!detail) return <p>상세 정보 불러오는 중</p>;
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

  // 제출된 도감 수정 상세 정보
  const handlePendingClick = async (entry) => {
    if (selectedPending?.id === entry.id) {
      setSelectedPending(null);
      setPendingDetail(null);
    } else {
      setSelectedPending(entry);
      try {
        const res = await axiosInstance.get(`/api/v1/wiki/user/modify/detail/${entry.id}`);
        setPendingDetail(res.data);
      } catch (err) {
        setPendingDetail(null);
      }
    }
  };

  // 거절된 도감 수정 상세 정보
  const handleRejectedClick = async (entry) => {
    if (selectedRejected?.id === entry.id) {
      setSelectedRejected(null);
      setRejectedDetail(null);
    } else {
      setSelectedRejected(entry);
      try {
        const res = await axiosInstance.get(`/api/v1/wiki/user/modify/detail/${entry.id}`);
        setRejectedDetail(res.data);
      } catch (err) {
        setRejectedDetail(null);
      }
    }
  };

  // 제출 취소 핸들러
  const handleCancelPending = async (id) => {
    if (!window.confirm("제출을 취소하시겠습니까?")) return;

    try {
      await axiosInstance.delete(`/api/v1/wiki/user/modification/${id}/cancel`);
      alert("제출이 취소되었습니다.");

      // 취소 후 목록 갱신
      setPendingList(prev => prev.filter(item => item.id !== id));
      if (selectedPending?.id === id) {
        setSelectedPending(null);
        setPendingDetail(null);
      }
    } catch (err) {
      console.error("제출 취소 실패:", err);
      alert("제출 취소 중 오류가 발생했습니다.");
    }
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
              <div
                key={item.id}
                className={`entry-card ${selectedRejected?.id === item.id ? 'selected' : ''}`}
                onClick={() => handleRejectedClick(item)}
                style={{ cursor: 'pointer' }}
              >
                <div className="entry-header">
                  <div className="entry-info">
                    <h3 className="entry-name">{item.name}</h3>
                    <span className="entry-date">{formatDate(item.createdDate)}</span>
                  </div>
                  <div className="entry-actions">
                    <button 
                      onClick={e => { e.stopPropagation(); goToResubmitPage(item.id); }}
                      className="approve-button"
                    >
                      보완 제출
                    </button>
                  </div>
                </div>
                {selectedRejected?.id === item.id && (
                  <div className="entry-details">
                    <p>거절 사유</p>
                    <div className="reason-text">{item.description || '사유가 제공되지 않았습니다.'}</div>
                    {renderEntryDetail(rejectedDetail)}
                  </div>
                )}
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
              <div
                key={item.id}
                className={`entry-card ${selectedPending?.id === item.id ? 'selected' : ''}`}
                onClick={() => handlePendingClick(item)}
                style={{ cursor: 'pointer' }}
              >
                <div className="entry-header">
                  <div className="entry-info">
                    <h3 className="entry-name">{item.name}</h3>
                    <span className="entry-date">{formatDate(item.createdDate)}</span>
                  </div>
                  <div className="entry-actions">
                    <button
                      onClick={e => { e.stopPropagation(); handleCancelPending(item.id); }}
                      className="cancel-button"
                    >
                      제출 취소
                    </button>
                  </div>
                </div>
                {selectedPending?.id === item.id && (
                  <div className="entry-details">
                    <p>제출 사유</p>
                    <div className="reason-text">{item.description || '사유가 제공되지 않았습니다.'}</div>
                    {renderEntryDetail(pendingDetail)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
