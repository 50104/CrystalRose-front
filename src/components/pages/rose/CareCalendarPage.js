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
  const monthRefs = useRef([]);
  const [isYearView, setIsYearView] = useState(false);

  useEffect(() => { // 초기 3개월 로딩
    const today = new Date();
    const initialMonths = [
      new Date(today.getFullYear(), today.getMonth() - 1, 1),
      new Date(today.getFullYear(), today.getMonth(), 1),
      new Date(today.getFullYear(), today.getMonth() + 1, 1)
    ];
    setMonths(initialMonths);

    initialMonths.forEach(month => loadMonthData(month));

    setTimeout(() => {
      scrollToToday();
      const todayMonthIndex = initialMonths.findIndex(
        m => m.getFullYear() === today.getFullYear() && m.getMonth() === today.getMonth()
      );

      const targetEl = monthRefs.current[todayMonthIndex];
      const containerEl = containerRef.current;

      if (targetEl && containerEl) {
        const containerTop = containerEl.getBoundingClientRect().top;
        const targetTop = targetEl.getBoundingClientRect().top;
        const offset = targetTop - containerTop;

        containerEl.scrollTop = containerEl.scrollTop + offset;
      }
    }, 30);
  }, []);

  const scrollToToday = useCallback(() => {
    const today = new Date();
    const todayMonthIndex = months.findIndex(
      (m) => m.getFullYear() === today.getFullYear() && m.getMonth() === today.getMonth()
    );

    if (todayMonthIndex !== -1 && monthRefs.current[todayMonthIndex] && containerRef.current) {
      const containerTop = containerRef.current.getBoundingClientRect().top;
      const targetTop = monthRefs.current[todayMonthIndex].getBoundingClientRect().top;
      const offset = targetTop - containerTop;

      containerRef.current.scrollTo({
        top: containerRef.current.scrollTop + offset,
        behavior: 'smooth'
      });
    }
  }, [months]);

  const handleJumpToMonth = (monthIdx) => {
    const targetMonth = new Date(new Date().getFullYear(), monthIdx, 1);
    const existingIndex = months.findIndex(
      m => m.getFullYear() === targetMonth.getFullYear() && m.getMonth() === targetMonth.getMonth()
    );

    if (existingIndex !== -1) {
      const targetEl = monthRefs.current[existingIndex];
      const containerEl = containerRef.current;
      if (containerEl && targetEl) {
        const containerTop = containerEl.getBoundingClientRect().top;
        const targetTop = targetEl.getBoundingClientRect().top;
        containerEl.scrollTop += targetTop - containerTop;
        setIsYearView(false);
      }
    } else {
      setMonths(prev => [...prev, targetMonth]);
      loadMonthData(targetMonth);
      setTimeout(() => {
        const index = months.length;
        const el = monthRefs.current[index];
        if (el && containerRef.current) {
          const offset = el.getBoundingClientRect().top - containerRef.current.getBoundingClientRect().top;
          containerRef.current.scrollTop += offset;
          setIsYearView(false);
        }
      }, 50);
    }
  };

  const loadMonthData = async (month) => {
    const monthKey = `${month.getFullYear()}-${month.getMonth()}`;
    if (logs[monthKey]) return;

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
        const currentMonthIndex = 1; // 현재달은 항상 두 번째
        const currentEl = monthRefs.current[currentMonthIndex];
        const containerEl = containerRef.current;

        if (containerEl && currentEl) {
          const top = currentEl.offsetTop - containerEl.offsetTop;
          containerEl.scrollTop = top - 16;
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
    const lastDay = new Date(year, monthNum + 1, 0);

    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // 일요일 시작

    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay())); // 토요일 끝

    // 주 수 계산
    const totalDays = (endDate - startDate) / (1000 * 60 * 60 * 24) + 1;
    const weekCount = totalDays / 7;
    const daysToRender = weekCount <= 5 ? 35 : 42; // 5주인 경우에만 35일, 6주인 경우 42일

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < daysToRender; i++) {
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
    const dayDiary = diaries[monthKey]?.find(diary => new Date(diary.recordedAt).toISOString().split('T')[0] === dateKey);
    return { logs: dayLogs, diary: dayDiary };
  };

  const diaryMap = {};
  Object.values(diaries).flat().forEach(d => {
    const key = new Date(d.recordedAt).toISOString().split('T')[0];
    diaryMap[key] = d.imageUrl;
  });

  return (
    <>
      <div className="calendar-toolbar">
        <button className="today-button" onClick={scrollToToday}>오늘로 이동</button>
        <button
          className="today-button"
          onClick={() => {
            if (isYearView) {
              setIsYearView(false);
              setTimeout(() => scrollToToday(), 0);
            } else {
              setIsYearView(true);
            }
          }}
        >
          {isYearView ? '월간 보기' : '연간 보기'}
        </button>
      </div>

      {isYearView ? (
        <div className="year-grid">
          {Array.from({ length: 12 }).map((_, monthIndex) => {
            const year = new Date().getFullYear();
            const month = new Date(year, monthIndex, 1);
            const days = generateCalendarDays(month);
            return (
              <div className="mini-month" key={monthIndex} onClick={() => handleJumpToMonth(monthIndex)}>
                <h4>{monthIndex + 1}월</h4>
                <div className="mini-weekdays">
                  {['일', '월', '화', '수', '목', '금', '토'].map(day => <span key={day}>{day}</span>)}
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
                        <span className={`date-text ${hasDiary ? 'white-text' : ''}`}>{date.getDate()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="custom-calendar-container" ref={containerRef}>
          {months.map((month, monthIndex) => (
            <div key={`${month.getFullYear()}-${month.getMonth()}`} className="calendar-month" ref={(el) => (monthRefs.current[monthIndex] = el)}>
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
                      className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isCurrentMonth && dayData.diary?.imageUrl ? 'has-image' : ''}`}
                      style={{
                        backgroundImage: isCurrentMonth && dayData.diary?.imageUrl ? `url(${dayData.diary.imageUrl})` : 'none'
                      }}
                      onClick={() => isCurrentMonth && dayData.logs.length > 0 && setSelected(dayData.logs[0])}
                    >
                      <div className="day-number">{date.getDate()}</div>
                      {isCurrentMonth && dayData.logs.length > 0 && (
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
      )}
      {selected && <CareLogModal log={selected} onClose={() => setSelected(null)} />}
    </>
  );
};

export default CustomCalendar;
