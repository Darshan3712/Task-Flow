import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../utils/api';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [projects,  setProjects]  = useState([]);
  const [employees, setEmployees] = useState([]);
  const [services,  setServices]  = useState([]);
  const [tasks,     setTasks]     = useState({}); // { "projectId_YYYY-MM-DD": [...entries] }
  const [loading,   setLoading]   = useState(true);

  const { currentUser } = useAuth();

  // ── Load all reference data — only when authenticated ─────────────────────
  const loadAll = useCallback(async () => {
    if (!currentUser) return; // ← guard: no token, no requests
    try {
      setLoading(true);
      const [p, e, s, tMap] = await Promise.all([
        api.getProjects(),
        api.getEmployees(),
        api.getServices(),
        api.getAllTasks()
      ]);
      setProjects(p);
      setEmployees(e);
      setServices(s);
      setTasks(tMap || {});
    } catch (err) {
      console.error('Failed to load data:', err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Re-run whenever the logged-in user changes (login / logout)
  useEffect(() => {
    if (currentUser) {
      loadAll();
    } else {
      // User logged out — clear all data
      setProjects([]);
      setEmployees([]);
      setServices([]);
      setTasks({});
      setLoading(false);
    }
  }, [currentUser, loadAll]);

  // ── Projects ──────────────────────────────────────────────────────────────
  const addProject = async (name, serviceIds = []) => {
    const project = await api.createProject(name, serviceIds);
    setProjects((prev) => [...prev, project]);
    return project;
  };

  const deleteProject = async (id) => {
    await api.deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setEmployees((prev) => prev.filter((e) => e.projectId !== id));
  };

  const updateProject = async (id, fields) => {
    const updated = await api.updateProject(id, fields);
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
  };

  // ── Employees ────────────────────────────────────────────────────────────
  const addEmployee = async (name, username, password, designation) => {
    const emp = await api.createEmployee({ name, username, password, designation });
    setEmployees((prev) => [...prev, emp]);
    return emp;
  };

  const deleteEmployee = async (id) => {
    await api.deleteEmployee(id);
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  // ── Services ─────────────────────────────────────────────────────────────
  const addService = async (name, description) => {
    const service = await api.createService(name, description);
    setServices((prev) => [...prev, service]);
    return service;
  };

  const deleteService = async (id) => {
    await api.deleteService(id);
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const updateService = async (id, fields) => {
    const updated = await api.updateService(id, fields);
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
  };

  // ── Tasks ─────────────────────────────────────────────────────────────────
  // taskKey = `${projectId}_${YYYY-MM-DD}`  (mirrors old localStorage key format)
  const saveTasks = async (projectId, dateStr, taskList) => {
    const key = `${projectId}_${dateStr}`;
    const entries = await api.saveTasks(projectId, dateStr, taskList);
    setTasks((prev) => ({ ...prev, [key]: entries }));
  };

  const getTasks = (projectId, dateStr) => {
    const key = `${projectId}_${dateStr}`;
    return tasks[key] || [];
  };

  const loadTasksForProject = async (projectId) => {
    const taskMap = await api.getAllProjectTasks(projectId);
    // taskMap: { "YYYY-MM-DD": [...entries] }
    const newEntries = {};
    Object.entries(taskMap).forEach(([date, entries]) => {
      newEntries[`${projectId}_${date}`] = entries;
    });
    setTasks((prev) => ({ ...prev, ...newEntries }));
    return newEntries;
  };

  const deleteTasks = async (projectId, dateStr) => {
    const key = `${projectId}_${dateStr}`;
    await api.deleteTasks(projectId, dateStr);
    setTasks((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  return (
    <DataContext.Provider value={{
      projects, employees, services, tasks, loading,
      addProject, deleteProject, updateProject,
      addEmployee, deleteEmployee,
      addService, deleteService, updateService,
      saveTasks, getTasks, deleteTasks, loadTasksForProject,
      reload: loadAll,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}


