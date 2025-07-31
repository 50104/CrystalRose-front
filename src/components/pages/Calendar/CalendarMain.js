import React, { useState, useEffect, useRef, useCallback } from 'react';
import { axiosInstance } from '@utils/axios';
import CareLogModal from './CareLogModal';
import CareLogRegister from './CareLogRegister';
import { getAccessToken } from '@utils/api/token';
import MonthlyCalendar from './CalendarMonthly';
import YearlyCalendar from './CalendarYearly';
import './CalendarMain.css';

const CARE_LABELS = {
  watering: '💧',
  fertilizer: '💊',
  pesticide: '🪰',
  adjuvant: '🧪',
  fungicide: '🧼',
  compost: '💩',
  note: '📝'
};

const CustomCalendar = () => {
  const [months, setMonths] = useState([]);
  const [logs, setLogs] = useState({});
  const [diaries, setDiaries] = useState({});
  const [selected, setSelected] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isYearView, setIsYearView] = useState(false);
  const containerRef = useRef(null);
  const monthRefs = useRef([]);
  const [calendarKey, setCalendarKey] = useState(Date.now());

  useEffect(() => {
    if (!isYearView) {
      setCalendarKey(Date.now());
    }
  }, [isYearView]);

  // 토큰 체크
  useEffect(() => {
    const checkAndRefreshToken = async () => {
      const token = localStorage.getItem('access');
      if (!token) return;

      try {
        await getAccessToken();
      } catch (error) {
        console.error('토큰 재발급 실패', error);
        localStorage.removeItem('access');
        window.location.href = '/login';
      }
    };
    checkAndRefreshToken();
  }, []);

  // 공통 유틸리티 함수들
  const getDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getMonthKey = (date) => `${date.getFullYear()}-${date.getMonth()}`;

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

  const getDayData = (date) => {
    const monthKey = getMonthKey(date);
    const dateKey = getDateKey(date);

    const rawLogs = logs[monthKey];
    const dayLogs = Array.isArray(rawLogs)
      ? rawLogs.filter(log => log.careDate === dateKey)
      : [];

    const diaryList = diaries[monthKey];
    const dayDiary = Array.isArray(diaryList)
      ? diaryList.find(diary => {
          const diaryDate = new Date(diary.recordedAt);
          return getDateKey(diaryDate) === dateKey;
        })
      : null;

    return { logs: dayLogs, diary: dayDiary };
  };

  // 데이터 로딩
  const loadMonthData = useCallback(async (month, force = false) => {
    const monthKey = `${month.getFullYear()}-${month.getMonth()}`;
    if (!force && logs[monthKey]) return;

    setLoading(true);
    try {
      const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
      const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);

      const response = await axiosInstance.get(`/api/calendar/data`, {
        params: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }
      });

      const { careLogs = [], diaries: diaryList = [] } = response.data;

      setLogs(prev => ({ ...prev, [monthKey]: careLogs }));
      setDiaries(prev => ({ ...prev, [monthKey]: diaryList }));
    } catch (error) {
      console.error('월 데이터 로딩 실패:', error);
      setLogs(prev => ({ ...prev, [monthKey]: [] }));
      setDiaries(prev => ({ ...prev, [monthKey]: [] }));
    } finally {
      setLoading(false);
    }
  }, [logs]);

  const loadAllYearData = useCallback(async (year) => {
    const monthsToLoad = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1))
      .filter(month => {
        const key = getMonthKey(month);
        return !logs[key];
      });

    setLoading(true);
    try {
      await Promise.all(monthsToLoad.map(month => loadMonthData(month)));
      setMonths(prev => {
        const existingKeys = prev.map(m => getMonthKey(m));
        const newMonths = monthsToLoad.filter(m => !existingKeys.includes(getMonthKey(m)));
        return [...prev, ...newMonths].sort((a, b) => a - b);
      });
    } catch (err) {
      console.error('연간 데이터 로딩 실패', err);
    } finally {
      setLoading(false);
    }
  }, [logs, loadMonthData]);

  // 이벤트 핸들러들
  const handleDateClick = (date, dayData) => {
    if (dayData.logs.length > 0) {
      setSelected(dayData.logs[0]);
    } else {
      setSelectedDate(date);
      setShowRegisterModal(true);
    }
  };

  const handleRegisterSuccess = () => {
    setShowRegisterModal(false);
    setShowEditModal(false);
    if (selectedDate) refreshMonth(selectedDate);
    if (selected) refreshMonth(new Date(selected.careDate));
    setSelectedDate(null);
    setSelected(null);
  };

  const refreshMonth = (targetDate) => {
    const monthKey = `${targetDate.getFullYear()}-${targetDate.getMonth()}`;
    setLogs(prev => {
      const copy = { ...prev };
      delete copy[monthKey];
      return copy;
    });
    setDiaries(prev => {
      const copy = { ...prev };
      delete copy[monthKey];
      return copy;
    });
    loadMonthData(new Date(targetDate.getFullYear(), targetDate.getMonth(), 1), true);
  };

  const handleEdit = () => {
    if (selected) {
      refreshMonth(new Date(selected.careDate));
    }
    setSelected(null);
  };

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
        top: containerRef.current.scrollTop + offset + 2,
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

  // 공통 props 객체
  const commonProps = {
    getDateKey,
    getMonthKey,
    generateCalendarDays,
    getDayData,
    handleDateClick,
    CARE_LABELS
  };

  return (
    <>
      <div className="calendar-toolbar">
        <div></div>
        <div className="view-buttons">
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
      </div>

      {isYearView ? (
        <YearlyCalendar
          {...commonProps}
          logs={logs}
          diaries={diaries}
          loading={loading}
          loadAllYearData={loadAllYearData}
          handleJumpToMonth={handleJumpToMonth}
        />
      ) : (
        <MonthlyCalendar
          key={calendarKey}
          {...commonProps}
          months={months}
          setMonths={setMonths}
          logs={logs}
          diaries={diaries}
          loading={loading}
          containerRef={containerRef}
          monthRefs={monthRefs}
          loadMonthData={loadMonthData}
          scrollToToday={scrollToToday}
        />
      )}

      {selected && (
        <CareLogModal 
          log={selected} 
          onClose={() => setSelected(null)} 
          onEdit={handleEdit} 
        />
      )}
      {showRegisterModal && selectedDate && (
        <div className="modal-backdrop" onClick={() => setShowRegisterModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <CareLogRegister 
              selectedDate={selectedDate}
              onSuccess={handleRegisterSuccess} 
              onCancel={() => setShowRegisterModal(false)}
            />
          </div>
        </div>
      )}
      {showEditModal && selected && (
        <div className="modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <CareLogRegister 
              selectedDate={new Date(selected.careDate)}
              editData={selected}
              onSuccess={handleRegisterSuccess} 
              onCancel={() => setShowEditModal(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default CustomCalendar;