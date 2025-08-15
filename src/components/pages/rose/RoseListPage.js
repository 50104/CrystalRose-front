import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RoseListPage.css';
import { HiOutlinePencilAlt } from 'react-icons/hi';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { axiosInstance } from '@utils/axios';

export default function RoseListPage() {
  const [roses, setRoses] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc'); // 날짜 정렬 기준
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const SCROLL_POSITION_KEY = 'roseListScrollPosition'; // 스크롤 위치 저장 키

  useEffect(() => {
    fetchMyRoses();
  }, []);

  // 스크롤 위치 복원
  useEffect(() => {
    if (!loading && roses.length > 0) {
      const savedScrollPosition = sessionStorage.getItem(SCROLL_POSITION_KEY);
      if (savedScrollPosition) {
        setTimeout(() => {
          window.scrollTo(0, parseInt(savedScrollPosition, 10));
        }, 100);
      }
    }
  }, [loading, roses]);

  // 스크롤 위치 저장
  useEffect(() => {
    const saveScrollPosition = () => {
      sessionStorage.setItem(SCROLL_POSITION_KEY, window.pageYOffset.toString());
    };

    window.addEventListener('beforeunload', saveScrollPosition);

    return () => {
      window.removeEventListener('beforeunload', saveScrollPosition);
    };
  }, []);

  const handleNavigateWithScroll = (path, state = null) => {
    sessionStorage.setItem(SCROLL_POSITION_KEY, window.pageYOffset.toString());
    if (state) {
      navigate(path, { state });
    } else {
      navigate(path);
    }
  };

  const fetchMyRoses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/api/roses/list`);
      if (response.data && Array.isArray(response.data)) {
        setRoses(response.data);
      } else {
        setRoses([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setRoses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRose = async (roseId) => {
    const confirmDelete = window.confirm('장미를 목록에서 삭제하시겠습니까?');
    if (!confirmDelete) return;

    try {
      await axiosInstance.delete(`/api/roses/delete/${roseId}`);
      alert('장미가 삭제되었습니다.');
      fetchMyRoses();
    } catch (error) {
      const message = error.response?.data?.message || '삭제 중 오류가 발생했습니다.';
      alert(message);
    }
  };

  const handleEditClick = (rose) => {
    sessionStorage.setItem(SCROLL_POSITION_KEY, window.pageYOffset.toString());
    navigate('/rose/register', {
      state: {
        roseData: rose,
        wikiId: rose.wikiId,
        varietyName: rose.varietyName,
      }
    });
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '날짜 정보 없음';
    }
  };

  if (loading) {
    return (
      <div className="rose-list-loading-container">
        <div className="rose-list-loading-text">불러오는 중</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rose-list-error-container">
        <p>오류: {error}</p>
        <button onClick={fetchMyRoses} className="rose-list-retry-button">
          다시 시도
        </button>
      </div>
    );
  }

  // 정렬된 리스트 반환
  const sortedRoses = [...roses].sort((a, b) => {
    const dateA = new Date(a.acquiredDate);
    const dateB = new Date(b.acquiredDate);
    if (sortOrder === 'asc') {
      return dateA - dateB;
    } else {
      return dateB - dateA;
    }
  });

  return (
    <div className="rose-list-container">
      <div className="rose-list-header">
        <div className='rose-title-button'>
          <h1 className="rose-list-title">내 장미 목록</h1>
          <button
            className="rose-list-toggle-sort-btn"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', padding: 0 }}
            title={sortOrder === 'asc' ? '날짜 내림차순' : '날짜 오름차순'}
          >
            {sortOrder === 'asc' ? <FaArrowUp /> : <FaArrowDown />}
          </button>
        </div>
        <div className="rose-list-buttons">
          <div onClick={() => handleNavigateWithScroll('/diaries/list')} className="rose-diary-button">성장기록</div>
          <div onClick={() => handleNavigateWithScroll('/rose/register')} className="rose-register-button">+ 장미 등록</div>
        </div>
      </div>

      {roses.length === 0 ? (
        <div className="rose-list-no-entries">
          등록된 장미가 없습니다.
          <br /><br />
          <div onClick={() => handleNavigateWithScroll('/rose/register')} className="rose-entry-action-link">
            첫 번째 장미 등록하기
          </div>
        </div>
      ) : (
        <div className="rose-entries-grid">
          {sortedRoses.map(rose => (
            <div key={rose.id} className="rose-entry-card">
              <div className="rose-image-wrapper">
                {rose.imageUrl && (
                  <img 
                    src={rose.imageUrl} 
                    alt={rose.nickname || '장미'} 
                    className="rose-entry-image" 
                  />
                )}
                <div
                  className="rose-delete-circle"
                  onClick={() => handleDeleteRose(rose.id)}
                  title="삭제"
                >
                  ×
                </div>
              </div>
              <div className="rose-entry-content">
                <div className="rose-entry-details">
                  <h2 className="rose-entry-nickname">
                    {rose.nickname || '이름 없음'}
                    <HiOutlinePencilAlt
                      className="rose-edit-icon"
                      onClick={() => handleEditClick(rose)}
                      title="수정"
                    />
                  </h2>
                  <p className="rose-entry-variety">{rose.varietyName || '품종 정보 없음'}</p>
                </div>
                <div className="rose-entry-acquired-date">
                  입양일 : {formatDate(rose.acquiredDate)}
                </div>
                {rose.locationNote && (
                  <div className="rose-entry-location">
                    메모 : {rose.locationNote}
                  </div>
                )}
                <div className="rose-entry-actions">
                  <div onClick={() => handleNavigateWithScroll(`/diaries/register/${rose.id}`)} className="rose-entry-action-link">+ 기록 추가</div>
                  <div className="rose-entry-actions-row">
                    <div onClick={() => handleNavigateWithScroll(`/diaries/${rose.id}/timeline`, { nickname: rose.nickname })} className="rose-entry-action-link secondary">타임라인</div>
                    <div onClick={() => handleNavigateWithScroll(`/diaries/${rose.id}/timelapse`, { nickname: rose.nickname })} className="rose-entry-action-link secondary">타임랩스</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}