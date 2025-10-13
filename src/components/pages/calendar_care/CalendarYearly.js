import React, { useEffect } from 'react';
import './CalendarYearly.css';

const YearlyCalendar = ({
  logs,
  diaries,
  loading,
  loadAllYearData,
  handleJumpToMonth,
  getDateKey,
  generateCalendarDays
}) => {

  // 연간 데이터 로딩
  useEffect(() => {
    loadAllYearData(new Date().getFullYear());
  }, [loadAllYearData]);

  // 다이어리 맵 생성
  const diaryMap = {};
  Object.values(diaries).flat().forEach(d => {
    const date = new Date(d.recordedAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const key = `${year}-${month}-${day}`;
    diaryMap[key] = d.imageUrl;
  });

  return (
    <div className="year-grid">
      {Array.from({ length: 12 }).map((_, monthIndex) => {
        const year = new Date().getFullYear();
        const month = new Date(year, monthIndex, 1);
        const days = generateCalendarDays(month);
        
        return (
          <div 
            className="mini-month" 
            key={monthIndex} 
            onClick={() => handleJumpToMonth(monthIndex)}
          >
            <h4>{monthIndex + 1}월</h4>
            <div className="mini-weekdays">
              {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <div className="mini-days">
              {days.map(date => {
                const key = getDateKey(date);
                const isCurrentMonth = date.getMonth() === monthIndex;
                const hasDiary = isCurrentMonth && diaryMap[key];
                
                return (
                  <div
                    key={key}
                    className={`mini-day ${isCurrentMonth ? '' : 'dimmed'} ${hasDiary ? 'has-image' : ''}`}
                    style={hasDiary ? {
                      backgroundImage: `url(${diaryMap[key]})`,
                      backgroundSize: 'contain',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    } : {}}
                  >
                    <span className={`date-text ${hasDiary ? 'white-text' : ''}`}>
                      {date.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      {loading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
};

export default YearlyCalendar;