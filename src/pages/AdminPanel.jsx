import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { FiArrowLeft, FiPlus, FiTrash2, FiBriefcase, FiUsers, FiLayers, FiEdit2 } from 'react-icons/fi';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('projects');
  const { projects, employees, services,
    addProject, deleteProject, updateProject,
    addEmployee, deleteEmployee,
    addService, deleteService, updateService } = useData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Project form state
  const [projectName, setProjectName] = useState('');
  const [projectAddress, setProjectAddress] = useState('');
  const [projectMsg, setProjectMsg] = useState('');

  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', address: '' });

  // Employee form state
  const [empName, setEmpName] = useState('');
  const [empUsername, setEmpUsername] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  const [empMsg, setEmpMsg] = useState('');

  // Service form state
  const [serviceName, setServiceName] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');
  const [serviceMsg, setServiceMsg] = useState('');

  const [editingServiceId, setEditingServiceId] = useState(null);
  const [serviceEditData, setServiceEditData] = useState({ name: '', description: '' });

  if (!currentUser || currentUser.role !== 'admin') {
    return <div className="access-denied">Access Denied</div>;
  }

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    addProject(projectName.trim(), projectAddress.trim());
    setProjectName('');
    setProjectAddress('');
    setProjectMsg('✅ Project added successfully!');
    setTimeout(() => setProjectMsg(''), 3000);
  };

  const handleAddEmployee = (e) => {
    e.preventDefault();
    if (!empName.trim() || !empUsername.trim() || !empPassword.trim()) return;
    const duplicate = employees.find((e) => e.username === empUsername.trim());
    if (duplicate) {
      setEmpMsg('❌ Username already exists!');
      setTimeout(() => setEmpMsg(''), 3000);
      return;
    }
    addEmployee(empName.trim(), empUsername.trim(), empPassword.trim());
    setEmpName('');
    setEmpUsername('');
    setEmpPassword('');
    setEmpMsg('✅ Employee added successfully!');
    setTimeout(() => setEmpMsg(''), 3000);
  };

  const handleAddService = (e) => {
    e.preventDefault();
    if (!serviceName.trim()) return;
    addService(serviceName.trim(), serviceDesc.trim());
    setServiceName('');
    setServiceDesc('');
    setServiceMsg('✅ Service added successfully!');
    setTimeout(() => setServiceMsg(''), 3000);
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="header-left-box">
          <button className="btn-back" onClick={() => navigate('/dashboard')}>
            <FiArrowLeft /> Back to Dashboard
          </button>
        </div>

        <div className="admin-user-center">
          {/* <span className="admin-role-label">Administrator</span> */}
          <h2 className="admin-user-name">{currentUser?.name}</h2>
        </div>

        <div className="header-right-spacer"></div>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          <FiBriefcase /> Projects
        </button>
        <button
          className={`admin-tab ${activeTab === 'employees' ? 'active' : ''}`}
          onClick={() => setActiveTab('employees')}
        >
          <FiUsers /> Employees
        </button>
        <button
          className={`admin-tab ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          <FiLayers /> Services
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'projects' && (
          <div className="admin-section">
            <div className="admin-form-card">
              <h3>Add New Project</h3>
              <form onSubmit={handleAddProject} className="admin-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Project Name *</label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="e.g. Website Overhaul"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Address / Location</label>
                    <input
                      type="text"
                      value={projectAddress}
                      onChange={(e) => setProjectAddress(e.target.value)}
                      placeholder="e.g. Remote / Mumbai"
                    />
                  </div>
                </div>
                <div className="form-row">
                </div>
                {projectMsg && <div className="form-msg">{projectMsg}</div>}
                <button type="submit" className="btn-add">
                  <FiPlus /> Add Project
                </button>
              </form>
            </div>

            <div className="admin-list-card">
              <h3>All Projects ({projects.length})</h3>
              {projects.length === 0 ? (
                <p className="empty-msg">No projects added yet.</p>
              ) : (
                <div className="list-table project-list-table">
                  <div className="list-header">
                    <span>#</span>
                    <span>Name</span>
                    <span>Address</span>
                    <span>Action</span>
                  </div>
                  {projects.map((p, i) => (
                    editingProjectId === p.id ? (
                      <div className="list-row" key={p.id}>
                        <span>{i + 1}</span>
                        <span><input type="text" value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} style={{ width: '100%', padding: '0.3rem' }} /></span>
                        <span><input type="text" value={editFormData.address} onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })} style={{ width: '100%', padding: '0.3rem' }} /></span>
                        <span style={{ display: 'flex', gap: '0.4rem' }}>
                          <button className="btn-add" style={{ padding: '0.3rem 0.6rem', margin: 0 }} onClick={() => { updateProject(p.id, editFormData); setEditingProjectId(null); }}>Save</button>
                          <button className="btn-delete" style={{ border: '1px solid var(--border)', color: 'var(--text)' }} onClick={() => setEditingProjectId(null)}>Cancel</button>
                        </span>
                      </div>
                    ) : (
                      <div className="list-row" key={p.id}>
                        <span>{i + 1}</span>
                        <span className="list-name">{p.name}</span>
                        <span>{p.address || '—'}</span>
                        <span style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            className="btn-back"
                            style={{ padding: '0.3rem 0.5rem', border: '1px solid var(--accent)', color: 'var(--accent)' }}
                            onClick={() => { setEditingProjectId(p.id); setEditFormData({ name: p.name, address: p.address || '' }); }}
                            title="Edit Project"
                          >
                            Edit
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => deleteProject(p.id)}
                            title="Delete Project"
                          >
                            <FiTrash2 />
                          </button>
                        </span>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'employees' && (
          <div className="admin-section">
            <div className="admin-form-card">
              <h3>Add New Employee</h3>
              <form onSubmit={handleAddEmployee} className="admin-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      value={empName}
                      onChange={(e) => setEmpName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Username *</label>
                    <input
                      type="text"
                      value={empUsername}
                      onChange={(e) => setEmpUsername(e.target.value)}
                      placeholder="e.g. rahul.sharma"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Password *</label>
                    <input
                      type="text"
                      value={empPassword}
                      onChange={(e) => setEmpPassword(e.target.value)}
                      placeholder="Set password"
                      required
                    />
                  </div>
                </div>
                {empMsg && <div className="form-msg">{empMsg}</div>}
                <button type="submit" className="btn-add">
                  <FiPlus /> Add Employee
                </button>
              </form>
            </div>

            <div className="admin-list-card">
              <h3>All Employees ({employees.length})</h3>
              {employees.length === 0 ? (
                <p className="empty-msg">No employees added yet.</p>
              ) : (
                <div className="list-table">
                  <div className="list-header">
                    <span>#</span>
                    <span>Name</span>
                    <span>Username</span>
                    <span>Password</span>
                    <span>Action</span>
                  </div>
                  {employees.map((emp, i) => (
                    <div className="list-row" key={emp.id}>
                      <span>{i + 1}</span>
                      <span className="list-name">{emp.name}</span>
                      <span>{emp.username}</span>
                      <span className="emp-password-cell">{emp.password}</span>
                      <span>
                        <button
                          className="btn-delete"
                          onClick={() => deleteEmployee(emp.id)}
                          title="Delete Employee"
                        >
                          <FiTrash2 />
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="admin-section">
            <div className="admin-form-card">
              <h3>Add New Service</h3>
              <form onSubmit={handleAddService} className="admin-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Service Name *</label>
                    <input
                      type="text"
                      value={serviceName}
                      onChange={(e) => setServiceName(e.target.value)}
                      placeholder="e.g. Design, Development"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description (Optional)</label>
                    <input
                      type="text"
                      value={serviceDesc}
                      onChange={(e) => setServiceDesc(e.target.value)}
                      placeholder="Short description..."
                    />
                  </div>
                </div>
                {serviceMsg && <div className="form-msg">{serviceMsg}</div>}
                <button type="submit" className="btn-add">
                  <FiPlus /> Add Service
                </button>
              </form>
            </div>

            <div className="admin-list-card">
              <h3>All Services ({services.length})</h3>
              {services.length === 0 ? (
                <p className="empty-msg">No services added yet.</p>
              ) : (
                <div className="list-table">
                  <div className="list-header">
                    <span>#</span>
                    <span>Name</span>
                    <span>Description</span>
                    <span>Action</span>
                  </div>
                  {services.map((s, i) => (
                    editingServiceId === s.id ? (
                      <div className="list-row" key={s.id}>
                        <span>{i + 1}</span>
                        <span><input type="text" value={serviceEditData.name} onChange={(e) => setServiceEditData({ ...serviceEditData, name: e.target.value })} style={{ width: '100%', padding: '0.3rem' }} /></span>
                        <span><input type="text" value={serviceEditData.description} onChange={(e) => setServiceEditData({ ...serviceEditData, description: e.target.value })} style={{ width: '100%', padding: '0.3rem' }} /></span>
                        <span style={{ display: 'flex', gap: '0.4rem' }}>
                          <button className="btn-add" style={{ padding: '0.3rem 0.6rem', margin: 0 }} onClick={() => { updateService(s.id, serviceEditData); setEditingServiceId(null); }}>Save</button>
                          <button className="btn-delete" style={{ border: '1px solid var(--border)', color: 'var(--text)' }} onClick={() => setEditingServiceId(null)}>Cancel</button>
                        </span>
                      </div>
                    ) : (
                      <div className="list-row" key={s.id}>
                        <span>{i + 1}</span>
                        <span className="list-name">{s.name}</span>
                        <span>{s.description || '—'}</span>
                        <span style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            className="btn-back"
                            style={{ padding: '0.3rem 0.6rem', border: '1px solid var(--accent)', color: 'var(--accent)' }}
                            onClick={() => { setEditingServiceId(s.id); setServiceEditData({ name: s.name, description: s.description || '' }); }}
                            title="Edit Service"
                          >
                            Edit
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => deleteService(s.id)}
                            title="Delete Service"
                          >
                            <FiTrash2 />
                          </button>
                        </span>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
