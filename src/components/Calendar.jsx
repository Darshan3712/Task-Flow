import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import TaskPopup from './TaskPopup';
import { format, startOfMonth, endOfMonth, getDay, getDaysInMonth, parseISO } from 'date-fns';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Calendar({ projectId, month, year, serviceIds = [] }) {
  const { projects, getTasks } = useData();
  const [selectedDate, setSelectedDate] = useState(null);

  const project = projects.find((p) => p.id === projectId);
  const firstDay = new Date(year, month, 1);
  const startOffset = (getDay(firstDay) + 6) % 7; // 0=Mon, 6=Sun
  const daysInMonth = getDaysInMonth(firstDay);

  // Build grid cells: nulls for offset, then day numbers
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  // Pad end to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  const today = new Date();
  const isToday = (day) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  const getDateStr = (day) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const getDayTasks = (day) => {
    if (!day) return [];
    const allTasks = getTasks(projectId, getDateStr(day));
    
    // Filter by services if specified
    if (serviceIds && serviceIds.length > 0) {
      return allTasks.filter(t => {
        const tServices = t.serviceIds || [];
        return serviceIds.some(id => tServices.includes(id));
      });
    }
    return allTasks;
  };

  const getOverallStatus = (tasks) => {
    if (!tasks || tasks.length === 0) return null;
    if (tasks.some(t => t.status === 'red')) return 'red';
    if (tasks.some(t => t.status === 'yellow')) return 'yellow';
    if (tasks.some(t => t.status === 'gray')) return 'gray';
    return 'green';
  };

  return (
    <div className="calendar-wrapper">
      <div className="calendar-title-bar">
        <h2 className="calendar-title">
          {project?.name} — {MONTHS[month]} {year}
        </h2>
        <div className="status-legend">
          <span className="legend-item"><span className="legend-dot gray"></span> In Progress</span>
          <span className="legend-item"><span className="legend-dot yellow"></span> Ready</span>
          <span className="legend-item"><span className="legend-dot green"></span> Completed</span>
          <span className="legend-item"><span className="legend-dot red"></span> Not Done</span>
        </div>
      </div>

      <div className="calendar-grid">
        {DAY_NAMES.map((d) => (
          <div key={d} className="cal-day-name">{d}</div>
        ))}
        {cells.map((day, idx) => {
          const dayTasks = getDayTasks(day);
          const isMultiTask = dayTasks.length >= 2;
          const overallStatus = getOverallStatus(dayTasks);

          return (
            <div
              key={idx}
              className={`cal-cell ${!day ? 'cal-cell-empty' : 'cal-cell-active'} ${isToday(day) ? 'cal-today' : ''} ${(!isMultiTask && overallStatus) ? `cell-status-${overallStatus}` : ''}`}
              onClick={() => day && setSelectedDate(getDateStr(day))}
            >
              {day && (
                <>
                  <span className="day-num">{day}</span>
                  <div className="day-tasks-container">
                    {dayTasks.map((t, tidx) => (
                      <div key={t.id || tidx} className="day-task-entry">
                        <span className="day-task-title">{t.title}</span>
                        {isMultiTask && (
                          <span className={`day-status-dot status-dot-${t.status} inline-status-dot`}></span>
                        )}
                      </div>
                    ))}
                  </div>
                  {!isMultiTask && overallStatus && (
                    <span className={`day-status-dot status-dot-${overallStatus} global-status-dot`}></span>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {selectedDate && (
        <TaskPopup
          projectId={projectId}
          dateStr={selectedDate}
          headerServiceIds={serviceIds}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}
