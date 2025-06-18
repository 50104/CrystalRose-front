import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { axiosInstance } from '@utils/axios';
import CareLogModal from './CareLogModal';
import './CareCalendar.css';

export default function CareLogCalendarPage() {
  const [logs, setLogs] = useState([]);
  const [diaries, setDiaries] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [careLogRes, diaryRes] = await Promise.all([
          axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/diaries/carelogs/list`),
          axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/diaries/list`)
        ]);
        
        setLogs(careLogRes.data);
        setDiaries(diaryRes.data);
        
        // 다이어리 이미지를 배경으로 설정
        setTimeout(() => {
          diaryRes.data.forEach(diary => {
            if (diary.imageUrl) {
              const dateStr = new Date(diary.recordedAt).toLocaleDateString('sv-SE');
              const dayElement = document.querySelector(`[data-date="${dateStr}"]`);
              if (dayElement) {
                const frameElement = dayElement.querySelector('.fc-daygrid-day-frame');
                if (frameElement) {
                  frameElement.style.backgroundImage = `url(${diary.imageUrl})`;
                  frameElement.style.backgroundSize = 'cover';
                  frameElement.style.backgroundPosition = 'center';
                  frameElement.style.backgroundRepeat = 'no-repeat';
                }
              }
            }
          });
        }, 100);
      } catch (error) {
        console.error('데이터 로딩 실패:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <div className="fullcalendar-wrapper">
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          locale="ko"
          events={logs.map(log => ({
            title: '🌹 관리',
            start: log.careDate,
            extendedProps: { log }
          }))}
          eventClick={(e) => setSelected(e.event.extendedProps.log)}
          datesSet={() => {
            // 달력이 다시 렌더링될 때마다 배경 이미지 재적용
            setTimeout(() => {
              diaries.forEach(diary => {
                if (diary.imageUrl) {
                  const dateStr = new Date(diary.recordedAt).toLocaleDateString('sv-SE');
                  const dayElement = document.querySelector(`[data-date="${dateStr}"]`);
                  if (dayElement) {
                    const frameElement = dayElement.querySelector('.fc-daygrid-day-frame');
                    if (frameElement) {
                      frameElement.style.backgroundImage = `url(${diary.imageUrl})`;
                      frameElement.style.backgroundSize = 'cover';
                      frameElement.style.backgroundPosition = 'center';
                      frameElement.style.backgroundRepeat = 'no-repeat';
                    }
                  }
                }
              });
            }, 100);
          }}
        />
      </div>
      {selected && <CareLogModal log={selected} onClose={() => setSelected(null)} />}
    </>
  );
}