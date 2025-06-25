// CustomCalendar.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { axiosInstance } from '@utils/axios';
import CareLogModal from './CareLogModal';
import './CareCalendar.css';

const CustomCalendar = () => {
  const [months, setMonths] = useState([]);
  const [logs, setLogs] = useState({});
  const [diaries, setDiaries] = useState({});
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  // 초기 3개월 생성 (이전달, 현재달, 다음달)
  useEffect(() => {
    const today = new Date();
    const initialMonths = [
      new Date(today.getFullYear(), today.getMonth() - 1, 1),
      new Date(today.getFullYear(), today.getMonth(), 1),
      new Date(today.getFullYear(), today.getMonth() + 1, 1)
    ];
    setMonths(initialMonths);
    
    // 초기 데이터 로드
    initialMonths.forEach(month => loadMonthData(month));
  }, []);

  const loadMonthData = async (month) => {
    const monthKey = `${month.getFullYear()}-${month.getMonth()}`;
    if (logs[monthKey]) return; // 이미 로드됨

    setLoading(true);
    try {
      const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
      const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      
      const [careLogRes, diaryRes] = await Promise.all([
        axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/diaries/carelogs/list`, {
          params: {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
          }
        }),
        axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/diaries/list`, {
          params: {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
          }
        })
      ]);
      
      setLogs(prev => ({ ...prev, [monthKey]: careLogRes.data }));
      setDiaries(prev => ({ ...prev, [monthKey]: diaryRes.data }));
    } catch (error) {
      console.error('월 데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = useCallback(() => {
    if (!containerRef.current || loading) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    
    // 하단 근처에 도달하면 다음 달 추가
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      const lastMonth = months[months.length - 1];
      const nextMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 1);
      
      setMonths(prev => [...prev, nextMonth]);
      loadMonthData(nextMonth);
    }
    
    // 상단 근처에 도달하면 이전 달 추가
    if (scrollTop <= 100) {
      const firstMonth = months[0];
      const prevMonth = new Date(firstMonth.getFullYear(), firstMonth.getMonth() - 1, 1);
      
      setMonths(prev => [prevMonth, ...prev]);
      loadMonthData(prevMonth);
      
      // 스크롤 위치 조정 (새로 추가된 달 높이만큼)
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = scrollTop + 400; // 대략적인 달 높이
        }
      }, 0);
    }
  }, [months, loading]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const generateCalendarDays = (month) => {
    const year = month.getFullYear();
    const monthNum = month.getMonth();
    const firstDay = new Date(year, monthNum, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // 주의 시작일
    
    const days = [];
    const current = new Date(startDate);
    
    // 6주 생성 (42일)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const getDateKey = (date) => date.toISOString().split('T')[0];
  
  const getMonthKey = (date) => `${date.getFullYear()}-${date.getMonth()}`;

  const getDayData = (date) => {
    const monthKey = getMonthKey(date);
    const dateKey = getDateKey(date);
    
    const dayLogs = logs[monthKey]?.filter(log => log.careDate === dateKey) || [];
    const dayDiary = diaries[monthKey]?.find(diary => 
      new Date(diary.recordedAt).toISOString().split('T')[0] === dateKey
    );
    
    return { logs: dayLogs, diary: dayDiary };
  };

  return (
    <>
      <div className="custom-calendar-container" ref={containerRef}>
        {months.map((month, monthIndex) => (
          <div key={`${month.getFullYear()}-${month.getMonth()}`} className="calendar-month">
            <div className="month-header">
              <h2>{month.getFullYear()}년 {month.getMonth() + 1}월</h2>
            </div>
            
            <div className="weekdays">
              {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                <div key={day} className="weekday">{day}</div>
              ))}
            </div>
            
            <div className="calendar-grid">
              {generateCalendarDays(month).map((date, dayIndex) => {
                const dayData = getDayData(date);
                const isCurrentMonth = date.getMonth() === month.getMonth();
                const isToday = getDateKey(date) === getDateKey(new Date());
                
                return (
                  <div
                    key={`${getDateKey(date)}-${monthIndex}`}
                    className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${dayData.diary?.imageUrl ? 'has-image' : ''}`}
                    style={{
                      backgroundImage: dayData.diary?.imageUrl ? `url(${dayData.diary.imageUrl})` : 'none'
                    }}
                    onClick={() => dayData.logs.length > 0 && setSelected(dayData.logs[0])}
                  >
                    <div className="day-number">{date.getDate()}</div>
                    {dayData.logs.length > 0 && (
                      <div className="day-event">🌹 관리</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="loading-indicator">
            <div className="spinner">로딩 중...</div>
          </div>
        )}
      </div>
      
      {selected && <CareLogModal log={selected} onClose={() => setSelected(null)} />}
    </>
  );
};

export default CustomCalendar;