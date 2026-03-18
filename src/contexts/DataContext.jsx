import { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const DataContext = createContext(null);

function loadFromStorage(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

export function DataProvider({ children }) {
  const [projects, setProjects] = useState(() => {
    const savedProjects = loadFromStorage('taskapp_projects', null);
    if (savedProjects) return savedProjects;
    // Migration: Check for old 'taskapp_companies' key
    const oldCompanies = loadFromStorage('taskapp_companies', null);
    if (oldCompanies) {
      localStorage.removeItem('taskapp_companies');
      return oldCompanies;
    }
    return [];
  });
  const [employees, setEmployees] = useState(() => loadFromStorage('taskapp_employees', []));
  const [services, setServices] = useState(() => loadFromStorage('taskapp_services', []));
  const [tasks, setTasks] = useState(() => {
    const savedTasks = loadFromStorage('taskapp_tasks', {});
    // Migration: Convert single objects to arrays if needed
    const migratedTasks = { ...savedTasks };
    let changed = false;
    Object.keys(migratedTasks).forEach(key => {
      if (migratedTasks[key] && !Array.isArray(migratedTasks[key])) {
        migratedTasks[key] = [migratedTasks[key]];
        changed = true;
      }
    });
    if (changed) {
      localStorage.setItem('taskapp_tasks', JSON.stringify(migratedTasks));
    }
    return migratedTasks;
  });

  useEffect(() => { localStorage.setItem('taskapp_projects', JSON.stringify(projects)); }, [projects]);
  useEffect(() => { localStorage.setItem('taskapp_employees', JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem('taskapp_services', JSON.stringify(services)); }, [services]);
  useEffect(() => { localStorage.setItem('taskapp_tasks', JSON.stringify(tasks)); }, [tasks]);

  const addProject = (name, serviceIds = []) => {
    const project = { id: uuidv4(), name, serviceIds };
    setProjects((prev) => [...prev, project]);
    return project;
  };

  const deleteProject = (id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setEmployees((prev) => prev.filter((e) => e.projectId !== id));
  };

  const updateProject = (id, fields) => {
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, ...fields } : p));
  };

  const addEmployee = (name, username, password) => {
    const emp = { id: uuidv4(), name, username, password };
    setEmployees((prev) => [...prev, emp]);
    return emp;
  };

  const deleteEmployee = (id) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  const addService = (name, description) => {
    const service = { id: uuidv4(), name, description };
    setServices((prev) => [...prev, service]);
    return service;
  };

  const deleteService = (id) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const updateService = (id, fields) => {
    setServices((prev) => prev.map((s) => s.id === id ? { ...s, ...fields } : s));
  };

  // taskKey = `${projectId}_${YYYY-MM-DD}`
  const saveTasks = (projectId, dateStr, taskList) => {
    const key = `${projectId}_${dateStr}`;
    setTasks((prev) => ({ ...prev, [key]: taskList }));
  };

  const getTasks = (projectId, dateStr) => {
    const key = `${projectId}_${dateStr}`;
    return tasks[key] || [];
  };

  const deleteTasks = (projectId, dateStr) => {
    const key = `${projectId}_${dateStr}`;
    setTasks((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  return (
    <DataContext.Provider value={{
      projects, employees, services, tasks,
      addProject, deleteProject, updateProject,
      addEmployee, deleteEmployee,
      addService, deleteService, updateService,
      saveTasks, getTasks, deleteTasks
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
