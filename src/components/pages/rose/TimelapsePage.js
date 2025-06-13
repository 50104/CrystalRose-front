import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { axiosInstance } from '@utils/axios';
import './TimelapsePage.css';

export default function TimelapsePage() {
  const { roseId } = useParams();
  const [diaryList, setDiaryList] = useState([]);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const containerRef = useRef(null);
  const intervalRef = useRef(null);
  const current = diaryList[index];

  // 5장 썸네일
  const getVisibleThumbnails = () => {
    if (diaryList.length === 0) return [];
    
    const totalItems = diaryList.length;
    const visibleCount = Math.min(5, totalItems);
    
    if (totalItems <= 5) {
      return diaryList.map((item, i) => ({ item, originalIndex: i }));
    }
    
    let startIndex;
    if (index <= 2) { // 처음 3장 사진
      startIndex = 0;
    } else if (index >= totalItems - 3) { // 마지막 3장 사진
      startIndex = totalItems - 5;
    } else { // 중간 사진
      startIndex = index - 2;
    }
    
    return Array.from({ length: visibleCount }, (_, i) => {
      const itemIndex = startIndex + i;
      return {
        item: diaryList[itemIndex],
        originalIndex: itemIndex
      };
    });
  };

  useEffect(() => {
    axiosInstance
      .get(`${process.env.REACT_APP_API_URL}/api/diaries/${roseId}/timeline`)
      .then((res) => setDiaryList(res.data))
      .catch((err) => console.error('타임랩스 조회 실패', err));
  }, [roseId]);

  useEffect(() => {
    if (!isPlaying || diaryList.length === 0) return;
    intervalRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % diaryList.length);
    }, 3000);
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, diaryList]);

  if (diaryList.length === 0) return <div className="timelapse-loading">로딩 중...</div>;

  const visibleThumbnails = getVisibleThumbnails();

  return (
    <div className="timelapse-wrapper">
      <div className="timelapse-container">
        <AnimatePresence mode="wait">
          <motion.img
            key={current.imageUrl}
            src={current.imageUrl}
            alt="장미 타임랩스 이미지"
            className="timelapse-image"
            initial={{ opacity: 0, scale: 1.05, filter: 'blur(3px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.98, filter: 'blur(3px)' }}  
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>

        <motion.div
          key={current.recordedAt}
          className="timelapse-info"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.6 }}
        >
          <p>📅 {new Date(current.recordedAt).toLocaleDateString('ko-KR')}</p>
          <p>📝 {current.note}</p>
        </motion.div>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="timelapse-toggle-button"
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
      </div>

      <div className="thumbnail-nav-wrapper">
        <div className="timelapse-thumbnails" ref={containerRef}>
          {visibleThumbnails.map(({ item, originalIndex }, visibleIndex) => (
            <img
              key={originalIndex}
              src={item.imageUrl}
              alt="썸네일"
              onClick={() => setIndex(originalIndex)}
              className={`thumbnail-image ${originalIndex === index ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}