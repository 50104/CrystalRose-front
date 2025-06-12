import { useEffect, useState } from 'react';
import { axiosInstance } from '@utils/axios';
import './DiaryList.css';

export default function DiaryListPage() {
  const [diaries, setDiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDiaries = async () => {
    try {
      const res = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/diaries/list`);
      console.log("📦 diary data", res.data);
      setDiaries(res.data);
    } catch (err) {
      setError('성장 기록을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiaries();
  }, []);

  if (loading) return <div className="diary-list-loading">로딩 중...</div>;
  if (error) return <div className="diary-list-error">{error}</div>;

  return (
    <div className="diary-list-container">
      <h1 className="diary-list-title">🌹 성장 기록</h1>
      {diaries.length === 0 ? (
        <div className="diary-list-empty">등록된 성장 기록이 없습니다.</div>
      ) : (
        <div className="diary-grid">
          {diaries.map(diary => (
            <div className="diary-card" key={diary.id}>
              {diary.imageUrl && (
                <img src={diary.imageUrl} alt="성장기록 이미지" className="diary-image" />
              )}
              <div className="diary-info">
                <p className="diary-date">
                  {diary.recordedAt ? new Date(diary.recordedAt).toLocaleDateString('ko-KR') : '날짜 없음'}
                </p>
                <p className="diary-note">
                  {diary.note || '메모 없음'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
