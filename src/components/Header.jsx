import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { FiLogOut, FiSettings, FiChevronDown } from 'react-icons/fi';
import { format } from 'date-fns';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Header({ onSearch }) {
  const { currentUser, logout } = useAuth();
  const { projects, services } = useData();
  const navigate = useNavigate();

  const now = new Date();
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  const servicesRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (servicesRef.current && !servicesRef.current.contains(event.target)) {
        setIsServicesOpen(false);
      }
    }
    if (isServicesOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isServicesOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleGo = () => {
    if (!selectedProjectId) return;
    onSearch({
      projectId: selectedProjectId,
      month: selectedMonth,
      year: selectedYear,
      serviceIds: selectedServiceIds
    });
  };

  const toggleService = (id) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const getServiceText = () => {
    if (selectedServiceIds.length === 0) return 'All Services';
    if (selectedServiceIds.length === 1) {
      const s = services.find(srv => srv.id === selectedServiceIds[0]);
      return s ? s.name : '1 Service';
    }
    return `${selectedServiceIds.length} Services`;
  };

  const years = [];
  for (let y = now.getFullYear() - 3; y <= now.getFullYear() + 3; y++) {
    years.push(y);
  }

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="header-logo">
          <img src="./New_Logo.png" alt="TaskFlow Logo" className="app-main-logo" />
        </div>
      </div>

      <div className="header-center">
        <div className="header-control">
          <label className="header-label">Services</label>
          <div className="multi-select-container header-services-ms" ref={servicesRef}>
            <div
              className={`dropdown-trigger header-trigger ${isServicesOpen ? 'active' : ''}`}
              onClick={() => setIsServicesOpen(!isServicesOpen)}
            >
              <span className="trigger-text">{getServiceText()}</span>
              <FiChevronDown className="trigger-icon" />
            </div>

            {isServicesOpen && (
              <div className="dropdown-menu header-dropdown-menu">
                {services.length === 0 ? (
                  <div className="no-emp-hint">No services added yet.</div>
                ) : (
                  services.map((s) => (
                    <label
                      key={s.id}
                      className={`emp-checkbox-item ${selectedServiceIds.includes(s.id) ? 'checked' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedServiceIds.includes(s.id)}
                        onChange={() => toggleService(s.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="emp-check-name">{s.name}</span>
                    </label>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="header-control">
          <label className="header-label">Project</label>
          <select
            className="header-select"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            <option value="">-- Select Project --</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="header-control">
          <label className="header-label">Month</label>
          <select
            className="header-select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {MONTHS.map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
        </div>

        <div className="header-control">
          <label className="header-label">Year</label>
          <select
            className="header-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <button
          className={`btn-go ${!selectedProjectId ? 'disabled' : ''}`}
          onClick={handleGo}
          disabled={!selectedProjectId}
        >
          Go
        </button>
      </div>

      <div className="header-right">
        {currentUser?.role === 'admin' && (
          <button className="btn-admin-panel" onClick={() => navigate('/admin')}>
            <FiSettings size={16} /> Admin Panel
          </button>
        )}
        <div className="user-badge">
          <span className="user-role">{currentUser?.role === 'admin' ? 'Admin' : (currentUser?.designation || 'Employee')}</span>
          <span className="user-name">{currentUser?.name}</span>
        </div>
        <button className="btn-logout" onClick={handleLogout} title="Logout">
          <FiLogOut size={20} />
        </button>
      </div>
    </header>
  );
}
