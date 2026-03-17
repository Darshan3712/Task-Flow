import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const ADMIN_CREDENTIALS = { username: 'admin', password: 'admin123' };

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('taskapp_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('taskapp_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('taskapp_current_user');
    }
  }, [currentUser]);

  const login = (username, password, role, employees = []) => {
    if (role === 'admin') {
      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        setCurrentUser({ id: 'admin', name: 'Admin', role: 'admin', companyId: null });
        return { success: true };
      }
      return { success: false, message: 'Invalid admin credentials.' };
    } else {
      const emp = employees.find(
        (e) => e.username === username && e.password === password
      );
      if (emp) {
        setCurrentUser({ id: emp.id, name: emp.name, role: 'employee', companyId: emp.companyId });
        return { success: true };
      }
      return { success: false, message: 'Invalid employee credentials.' };
    }
  };

  const logout = () => setCurrentUser(null);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
