import { useState, useEffect, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { FiX, FiSave, FiTrash2 } from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';

const STATUSES = [
  { value: 'gray',   label: 'In Progress', emoji: '⬜' },
  { value: 'yellow', label: 'Ready',       emoji: '🟡' },
  { value: 'green',  label: 'Completed',   emoji: '🟢' },
  { value: 'red',    label: 'Not Done',    emoji: '🔴' },
];

const MONTHS_FULL = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

export default function TaskPopup({ projectId, dateStr, headerServiceIds = [], onClose }) {
  const { projects, employees, services, saveTasks, getTasks, deleteTasks } = useData();
  const { currentUser } = useAuth();

  const existingTasks = getTasks(projectId, dateStr);

  const [taskList, setTaskList] = useState(() => {
    if (existingTasks && existingTasks.length > 0) return existingTasks;
    return [{
      id: uuidv4(),
      title: '',
      description: '',
      employeeIds: [],
      serviceIds: [],
      status: 'gray'
    }];
  });

  const [msg, setMsg] = useState('');
  const project = projects.find((p) => p.id === projectId);

  // Format date nicely
  const [yr, mo, dy] = dateStr.split('-');
  const displayDate = `${Number(dy)} ${MONTHS_FULL[Number(mo) - 1]} ${yr}`;

  const addTask = () => {
    setTaskList([...taskList, {
      id: uuidv4(),
      title: '',
      description: '',
      employeeIds: [],
      serviceIds: [],
      status: 'gray'
    }]);
  };

  const removeTask = (index) => {
    const newList = [...taskList];
    newList.splice(index, 1);
    setTaskList(newList);
  };

  const updateTaskField = (index, field, value) => {
    const newList = [...taskList];
    newList[index] = { ...newList[index], [field]: value };
    setTaskList(newList);
  };

  const toggleEmployee = (index, empId) => {
    const task = taskList[index];
    const prev = task.employeeIds || [];
    const newValue = prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId];
    updateTaskField(index, 'employeeIds', newValue);
  };

  const toggleService = (index, srvId) => {
    const task = taskList[index];
    const prev = task.serviceIds || [];
    const newValue = prev.includes(srvId) ? prev.filter((id) => id !== srvId) : [...prev, srvId];
    updateTaskField(index, 'serviceIds', newValue);
  };

  const handleSave = () => {
    const validTasks = taskList.filter(t => t.title.trim());
    if (validTasks.length === 0) {
      setMsg('Please enter a title for at least one task.');
      return;
    }
    
    saveTasks(projectId, dateStr, validTasks.map(t => ({
      ...t,
      title: t.title.trim(),
      description: t.description.trim(),
      updatedAt: new Date().toISOString(),
    })));

    setMsg('✅ Tasks saved!');
    setTimeout(() => onClose(), 800);
  };

  const handleDeleteAll = () => {
    deleteTasks(projectId, dateStr);
    onClose();
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-card multi-task-card" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <div>
            <div className="popup-project">{project?.name}</div>
            <div className="popup-date">{displayDate}</div>
          </div>
          <button className="popup-close" onClick={onClose}><FiX size={20} /></button>
        </div>

        <div className="popup-body scrollable-body">
          {taskList.map((task, idx) => (
            <TaskEntry 
              key={task.id || idx}
              task={task}
              index={idx}
              employees={employees}
              services={services}
              updateField={(f, v) => updateTaskField(idx, f, v)}
              onToggleEmp={(id) => toggleEmployee(idx, id)}
              onToggleSrv={(id) => toggleService(idx, id)}
              onRemove={() => removeTask(idx)}
              headerServiceIds={headerServiceIds}
              isLast={idx === taskList.length - 1}
              showRemove={taskList.length > 1}
            />
          ))}

          <button className="btn-add-another" onClick={addTask}>
            + Add Another Task for this Day
          </button>
        </div>

        {msg && <div className="popup-msg">{msg}</div>}

        <div className="popup-footer">
          {existingTasks.length > 0 && (
            <button className="btn-delete-task" onClick={handleDeleteAll}>
              <FiTrash2 /> Delete All
            </button>
          )}
          <button className="btn-save-task" onClick={handleSave}>
            <FiSave /> Save All Tasks
          </button>
        </div>
      </div>
    </div>
  );
}

function TaskEntry({ task, index, employees, services, updateField, onToggleEmp, onToggleSrv, onRemove, showRemove, headerServiceIds }) {
  const [isEmpOpen, setIsEmpOpen] = useState(false);
  const [isSrvOpen, setIsSrvOpen] = useState(false);
  
  const empRef = useRef(null);
  const srvRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (empRef.current && !empRef.current.contains(event.target)) {
        setIsEmpOpen(false);
      }
      if (srvRef.current && !srvRef.current.contains(event.target)) {
        setIsSrvOpen(false);
      }
    }
    if (isEmpOpen || isSrvOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEmpOpen, isSrvOpen]);

  // Filter services based on header selection
  const filteredServices = headerServiceIds.length > 0
    ? services.filter(s => headerServiceIds.includes(s.id))
    : services;

  const getEmpText = () => {
    const ids = task.employeeIds || [];
    if (ids.length === 0) return 'Select Employees';
    if (ids.length === 1) {
      const e = employees.find(emp => emp.id === ids[0]);
      return e ? e.name : '1 Employee';
    }
    return `${ids.length} Employees`;
  };

  const getSrvText = () => {
    const ids = task.serviceIds || [];
    if (ids.length === 0) return 'Select Services';
    if (ids.length === 1) {
      const s = services.find(srv => srv.id === ids[0]);
      return s ? s.name : '1 Service';
    }
    return `${ids.length} Services`;
  };

  return (
    <div className="task-entry-item">
      <div className="task-entry-header">
        <span className="task-number">Task {index + 1}</span>
        {showRemove && (
          <button className="btn-remove-entry" onClick={onRemove} title="Remove Task">
            <FiTrash2 size={16} />
          </button>
        )}
      </div>

      <div className="task-entry-content">
        <div className="task-entry-main">
          <div className="form-group">
            <label className="popup-label">Task Title</label>
            <input
              type="text"
              className="popup-input"
              placeholder="What needs to be done?"
              value={task.title}
              onChange={(e) => updateField('title', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="popup-label">Description</label>
            <textarea
              className="popup-input popup-textarea"
              placeholder="Add more details about the task..."
              value={task.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={2}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="popup-label">Employees</label>
              <div className="multi-select-container" ref={empRef}>
                <div 
                  className={`dropdown-trigger ${isEmpOpen ? 'active' : ''}`}
                  onClick={() => setIsEmpOpen(!isEmpOpen)}
                >
                  <span className="trigger-text">{getEmpText()}</span>
                  <span className="trigger-icon">▼</span>
                </div>
                {isEmpOpen && (
                  <div className="dropdown-menu">
                    {employees.length === 0 ? (
                      <div className="no-emp-hint">No employees available.</div>
                    ) : (
                      employees.map(emp => (
                        <label key={emp.id} className={`emp-checkbox-item ${task.employeeIds?.includes(emp.id) ? 'checked' : ''}`}>
                          <input
                            type="checkbox"
                            checked={task.employeeIds?.includes(emp.id)}
                            onChange={() => onToggleEmp(emp.id)}
                            onClick={e => e.stopPropagation()}
                          />
                          <div className="emp-check-info">
                            <div className="emp-check-name">{emp.name}</div>
                            <div className="emp-check-user">@{emp.username}</div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="popup-label">Services</label>
              <div className="multi-select-container" ref={srvRef}>
                <div 
                  className={`dropdown-trigger ${isSrvOpen ? 'active' : ''}`}
                  onClick={() => setIsSrvOpen(!isSrvOpen)}
                >
                  <span className="trigger-text">{getSrvText()}</span>
                  <span className="trigger-icon">▼</span>
                </div>
                {isSrvOpen && (
                  <div className="dropdown-menu popup-srv-menu">
                    {filteredServices.length === 0 ? (
                      <div className="no-emp-hint">No services match current filter.</div>
                    ) : (
                      filteredServices.map(srv => (
                        <label key={srv.id} className={`emp-checkbox-item ${task.serviceIds?.includes(srv.id) ? 'checked' : ''}`}>
                          <input
                            type="checkbox"
                            checked={task.serviceIds?.includes(srv.id)}
                            onChange={() => onToggleSrv(srv.id)}
                            onClick={e => e.stopPropagation()}
                          />
                          <span className="emp-check-name">{srv.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="task-entry-status">
          <label className="status-heading">Status</label>
          <div className="status-options-compact">
            {STATUSES.map((s) => (
              <label
                key={s.value}
                className={`status-chip status-opt-${s.value} ${task.status === s.value ? 'selected' : ''}`}
                title={s.label}
              >
                <input
                  type="radio"
                  name={`status-${task.id || index}`}
                  value={s.value}
                  checked={task.status === s.value}
                  onChange={() => updateField('status', s.value)}
                  hidden
                />
                <span className="status-emoji">{s.emoji}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
