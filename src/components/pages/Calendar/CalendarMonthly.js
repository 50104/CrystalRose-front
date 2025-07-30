import React, { useEffect, useCallback, useRef } from 'react';
import './CalendarMonthly.css';

const MonthlyCalendar = ({
  months,
  setMonths,
  logs,
  diaries,
  loading,
  containerRef,
  monthRefs,
  loadMonthData,
  scrollToToday,
  getDateKey,
  getMonthKey,
  generateCalendarDays,
  getDayData,
  handleDateClick,
  CARE_LABELS
}) => {
  const hasInitialized = useRef(false);

  // 초기화
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

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
  }, [scrollToToday, loadMonthData, setMonths, monthRefs, containerRef]);

  // 스크롤 핸들러
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
  }, [months, loading, loadMonthData, containerRef, monthRefs, setMonths]);

  // 스크롤 이벤트 등록
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll, containerRef]);

  return (
    <div className="custom-calendar-container" ref={containerRef}>
      {months.map((month, monthIndex) => (
        <div 
          key={`${month.getFullYear()}-${month.getMonth()}`} 
          className="calendar-month" 
          ref={(el) => (monthRefs.current[monthIndex] = el)}
        >
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
              const isToday = isCurrentMonth && getDateKey(date) === getDateKey(new Date());
              
              return (
                <div
                  key={`${getDateKey(date)}-${monthIndex}`}
                  className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isCurrentMonth && dayData.diary?.imageUrl ? 'has-image' : ''}`}
                  style={{
                    backgroundImage: isCurrentMonth && dayData.diary?.imageUrl ? `url(${dayData.diary.imageUrl})` : 'none'
                  }}
                  onClick={() => isCurrentMonth && handleDateClick(date, dayData)}
                >
                  <div className="day-number">{date.getDate()}</div>
                  {isCurrentMonth && dayData.logs.length > 0 && (
                    <div className="day-event">
                      {
                        Object.keys(CARE_LABELS)
                          .filter(key =>
                            dayData.logs.some(log => log[key])
                          )
                          .map(key => CARE_LABELS[key])
                          .join('')
                      }
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {loading && (
        <div className="loading-indicator">
          <div className="spinner">불러오는 중</div>
        </div>
      )}
    </div>
  );
};

export default MonthlyCalendar;