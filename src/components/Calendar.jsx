import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import TaskPopup from './TaskPopup';
import { startOfMonth, getDay, getDaysInMonth } from 'date-fns';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const STATUS_COLORS = {
  gray: '#6B7280',
  yellow: '#F59E0B',
  green: '#10B981',
  red: '#EF4444',
};

function buildCells(year, month) {
  const firstDay = new Date(year, month, 1);
  const startOffset = (getDay(firstDay) + 6) % 7;
  const daysInMonth = getDaysInMonth(firstDay);
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function getDateStr(year, month, day) {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

function getOverallStatus(tasks) {
  if (!tasks || tasks.length === 0) return null;
  if (tasks.some(t => t.status === 'red')) return 'red';
  if (tasks.some(t => t.status === 'yellow')) return 'yellow';
  if (tasks.some(t => t.status === 'gray')) return 'gray';
  return 'green';
}

function getWorstStatus(statuses) {
  if (!statuses || statuses.length === 0) return null;
  if (statuses.includes('red')) return 'red';
  if (statuses.includes('yellow')) return 'yellow';
  if (statuses.includes('gray')) return 'gray';
  return 'green';
}

// ─── MASTER VIEW CALENDAR ─────────────────────────────────────────────────────

function MasterCalendar({ month, year, serviceIds = [] }) {
  const { projects, getTasks } = useData();
  const [selectedDate, setSelectedDate] = useState(null);

  const cells = buildCells(year, month);
  const today = new Date();

  const isToday = (day) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  // For each day, gather flat list of { project, task } pairs
  const getDayEntries = (day) => {
    if (!day) return [];
    const dateStr = getDateStr(year, month, day);
    const entries = [];

    projects.forEach(p => {
      let allTasks = getTasks(p.id, dateStr);
      if (!allTasks || allTasks.length === 0) return;

      // Service filter
      if (serviceIds && serviceIds.length > 0) {
        allTasks = allTasks.filter(t => {
          const tServices = t.serviceIds || [];
          return serviceIds.some(id => tServices.includes(id));
        });
        if (allTasks.length === 0) return;
      }

      // Push each task individually (project name repeated per task)
      allTasks.forEach(task => {
        entries.push({ project: p, task });
      });
    });

    return entries;
  };

  return (
    <div className="calendar-wrapper">
      <div className="calendar-title-bar">
        <h2 className="calendar-title master-view-title">
          <span className="master-badge">★ Master View</span> — {MONTHS[month]} {year}
        </h2>
        <div className="status-legend">
          <span className="legend-item"><span className="legend-dot gray"></span> In Progress</span>
          <span className="legend-item"><span className="legend-dot yellow"></span> Ready</span>
          <span className="legend-item"><span className="legend-dot green"></span> Completed</span>
          <span className="legend-item"><span className="legend-dot red"></span> Not Done</span>
        </div>
      </div>

      <div className="calendar-overflow-container">
        <div className="calendar-grid">
          {DAY_NAMES.map((d) => (
            <div key={d} className="cal-day-name">{d}</div>
          ))}
          {cells.map((day, idx) => {
            const entries = getDayEntries(day);
            const isMulti = entries.length >= 2;
            const singleStatus = !isMulti && entries.length === 1 ? entries[0].task.status : null;

            return (
              <div
                key={idx}
                className={`cal-cell ${!day ? 'cal-cell-empty' : 'cal-cell-active'} ${isToday(day) ? 'cal-today' : ''} ${isMulti ? 'multi-task-cell' : ''} ${singleStatus ? `status-${singleStatus}` : ''}`}
                onClick={() => day && setSelectedDate(getDateStr(year, month, day))}
              >
                {day && (
                  <>
                    <span className="day-num">{day}</span>
                    <div className="master-entries-container">
                      {entries.map(({ project, task }, i) => (
                        <div
                          key={`${project.id}-${task.id || i}`}
                          className="day-task-entry"
                          title={project.name}
                        >
                          <span className="day-task-title">{project.name}</span>
                          <span className={`day-status-dot status-dot-${task.status} inline-status-dot`} />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <MasterDaySummary
          dateStr={selectedDate}
          serviceIds={serviceIds}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}

// ─── MASTER DAY SUMMARY POPUP ─────────────────────────────────────────────────

const MONTHS_FULL = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const STATUS_LABELS = {
  gray: 'In Progress',
  yellow: 'Ready',
  green: 'Completed',
  red: 'Not Done',
};

function MasterDaySummary({ dateStr, serviceIds, onClose }) {
  const { projects, getTasks } = useData();
  const [yr, mo, dy] = dateStr.split('-');
  const displayDate = `${Number(dy)} ${MONTHS_FULL[Number(mo) - 1]} ${yr}`;

  // Flat list of all individual tasks across all projects
  const entries = projects.reduce((acc, p) => {
    let tasks = getTasks(p.id, dateStr);
    if (!tasks || tasks.length === 0) return acc;
    if (serviceIds && serviceIds.length > 0) {
      tasks = tasks.filter(t => {
        const tServices = t.serviceIds || [];
        return serviceIds.some(id => tServices.includes(id));
      });
      if (tasks.length === 0) return acc;
    }
    tasks.forEach(task => acc.push({ task, projectName: p.name }));
    return acc;
  }, []);

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="master-day-popup" onClick={e => e.stopPropagation()}>
        <div className="popup-header">
          <div>
            <div className="popup-project" style={{ color: 'var(--accent)', fontWeight: 800 }}>★ Master View</div>
            <div className="popup-date">{displayDate}</div>
          </div>
          <button className="popup-close" onClick={onClose}>✕</button>
        </div>
        <div className="master-day-body">
          {entries.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
              No tasks scheduled for any project on this day.
            </p>
          ) : entries.map(({ task, projectName }, i) => (
            <div key={task.id || i} className={`master-popup-row master-popup-${task.status}`}>
              <span
                className="master-popup-dot"
                style={{ background: STATUS_COLORS[task.status] }}
              />
              <span className="master-popup-pname">{task.title || '(Untitled)'}</span>
              <span className={`master-popup-status status-badge-${task.status}`}>
                {STATUS_LABELS[task.status]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── REGULAR SINGLE-PROJECT CALENDAR ──────────────────────────────────────────

export default function Calendar({ projectId, month, year, serviceIds = [], isMasterView = false }) {
  const { projects, getTasks } = useData();
  const [selectedDate, setSelectedDate] = useState(null);
  const [activeTaskId, setActiveTaskId] = useState(null);

  // Render Master View if requested
  if (isMasterView) {
    return <MasterCalendar month={month} year={year} serviceIds={serviceIds} />;
  }

  const project = projects.find((p) => p.id === projectId);
  const cells = buildCells(year, month);
  const today = new Date();

  const isToday = (day) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  const getDayTasks = (day) => {
    if (!day) return [];
    const allTasks = getTasks(projectId, getDateStr(year, month, day));
    if (serviceIds && serviceIds.length > 0) {
      return allTasks.filter(t => {
        const tServices = t.serviceIds || [];
        return serviceIds.some(id => tServices.includes(id));
      });
    }
    return allTasks;
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

      <div className="calendar-overflow-container">
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
                className={`cal-cell ${!day ? 'cal-cell-empty' : 'cal-cell-active'} ${isToday(day) ? 'cal-today' : ''} ${isMultiTask ? 'multi-task-cell' : ''} ${(!isMultiTask && overallStatus) ? `status-${overallStatus}` : ''}`}
                onClick={() => day && setSelectedDate(getDateStr(year, month, day))}
              >
                {day && (
                  <>
                    <span className="day-num">{day}</span>
                    <div className="day-tasks-container">
                      {dayTasks.map((t, tidx) => (
                        <div
                          key={t.id || tidx}
                          className="day-task-entry"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDate(getDateStr(year, month, day));
                            setActiveTaskId(t.id);
                          }}
                        >
                          <span className="day-task-title" title={t.title}>{t.title}</span>
                          <span className={`day-status-dot status-dot-${t.status} inline-status-dot`}></span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <TaskPopup
          projectId={projectId}
          dateStr={selectedDate}
          headerServiceIds={serviceIds}
          activeTaskId={activeTaskId}
          onClose={() => {
            setSelectedDate(null);
            setActiveTaskId(null);
          }}
        />
      )}
    </div>
  );
}
