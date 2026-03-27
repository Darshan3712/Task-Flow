import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { FiLogOut, FiSettings, FiChevronDown } from 'react-icons/fi';


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
  const [selectedServiceId, setSelectedServiceId] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleGo = () => {
    if (!selectedProjectId) return;
    const isMasterView = selectedProjectId === '__master__';
    onSearch({
      projectId: isMasterView ? null : selectedProjectId,
      month: selectedMonth,
      year: selectedYear,
      serviceIds: selectedServiceId ? [selectedServiceId] : [],
      isMasterView,
    });
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
        <div className="mobile-actions">
          {currentUser?.role === 'admin' && (
            <button className="btn-mobile-nav" onClick={() => navigate('/admin')} title="Admin Panel">
              <FiSettings size={18} />
            </button>
          )}
          <button className="btn-mobile-nav" onClick={handleLogout} title="Logout">
            <FiLogOut size={18} />
          </button>
        </div>
      </div>

      <div className="header-center">
        <div className="header-control">
          <label className="header-label">Services</label>
          <select
            className="header-select"
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
          >
            <option value="">-- All Services --</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="header-control">
          <label className="header-label">Project</label>
          <select
            className="header-select"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            <option value="">-- Select Project --</option>
            <option value="__master__">★ Master View (All Projects)</option>
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
