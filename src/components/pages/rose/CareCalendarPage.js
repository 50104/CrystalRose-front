import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { axiosInstance } from '@utils/axios';
import CareLogModal from './CareLogModal';
import './CareCalendar.css';

export default function CareLogCalendarPage() {
  const [logs, setLogs] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/diaries/carelogs/list`)
      .then(res => setLogs(res.data));
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
        />
      </div>
      {selected && <CareLogModal log={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
