import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { axiosInstance } from '@utils/axios';
import './DiaryList.css';

export default function DiaryListPage() {
  const [diaries, setDiaries] = useState([]);
  const [careDates, setCareDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const [diaryRes, careDateRes] = await Promise.all([
        axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/diaries/list`),
        axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/diaries/caredates/list`)
      ]);
      setDiaries(diaryRes.data);

      // ISO → YYYY-MM-DD 문자열로 정규화
      const normalized = careDateRes.data.map(date =>
        new Date(date).toLocaleDateString('sv-SE')
      );
      setCareDates(normalized);
    } catch (err) {
      setError('성장 기록을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="diary-list-loading">로딩 중...</div>;
  if (error) return <div className="diary-list-error">{error}</div>;

  return (
    <div className="diary-list-container">
      <div className="diary-list-header">
        <h1 className="diary-list-title">성장 기록</h1>
        <div className="diary-list-buttons">
          <Link to="/roses/list" className="diary-roses-button">
            내 장미
          </Link>
          <Link to="/diaries/register" className="diary-register-button">
            + 기록 등록
          </Link>
        </div>
      </div>
      
      {diaries.length === 0 ? (
        <div className="diary-list-empty">등록된 성장 기록이 없습니다.</div>
      ) : (
        <div className="diary-grid">
          {diaries.map(diary => {
            const dateStr = new Date(diary.recordedAt).toLocaleDateString('sv-SE');
            const isCare = careDates.includes(dateStr);

            return (
              <div className="diary-card" key={diary.id}>
                {diary.imageUrl && (
                  <img src={diary.imageUrl} alt="성장기록 이미지" className="diary-image" />
                )}
                <div className="diary-info">
                  <p className="diary-date">
                    {new Date(diary.recordedAt).toLocaleDateString('ko-KR')}
                    {isCare && <span className="care-dot">🌹</span>}
                  </p>
                  <p className="diary-note">
                    {diary.note || '메모 없음'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}