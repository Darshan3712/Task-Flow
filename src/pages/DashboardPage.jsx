import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Calendar from '../components/Calendar';
import { useData } from '../contexts/DataContext';

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const { projects } = useData();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useState(null);

  const handleSearch = ({ projectId, month, year, serviceIds }) => {
    setSearchParams({ projectId, month, year, serviceIds });
  };

  return (
    <div className="dashboard-page">
      <Header onSearch={handleSearch} />

      <main className="dashboard-main">
        {!searchParams ? (
          <div className="hero-empty">
            <div className="hero-empty-icon">📅</div>
            <h2>Select a Project and Month</h2>
            <p>Choose a project and month from the header, then click <strong>Go</strong> to view the task calendar.</p>
            {projects.length === 0 && currentUser?.role === 'admin' && (
              <button className="btn-goto-admin" onClick={() => navigate('/admin')}>
                ➕ Add your first project in Admin Panel
              </button>
            )}
            {projects.length === 0 && currentUser?.role !== 'admin' && (
              <p className="hint-text">No projects available. Contact your Admin.</p>
            )}
          </div>
        ) : (
          <Calendar
            projectId={searchParams.projectId}
            month={searchParams.month}
            year={searchParams.year}
            serviceIds={searchParams.serviceIds}
          />
        )}
      </main>
    </div>
  );
}
