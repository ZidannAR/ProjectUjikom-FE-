import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [employee, setEmployee] = useState(() => {
    const saved = localStorage.getItem('auth_employee');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
  const [mustChangePassword, setMustChangePassword] = useState(() => {
    return localStorage.getItem('must_change_password') === 'true';
  });
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!token && !!employee;

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    // Skip fetching /me if must change password
    if (mustChangePassword) {
      setLoading(false);
      return;
    }

    api.get('/auth/me')
      .then(res => {
        setUser(res.data.user);
        setEmployee(res.data.employee);
        localStorage.setItem('auth_user', JSON.stringify(res.data.user));
        localStorage.setItem('auth_employee', JSON.stringify(res.data.employee));
      })
      .catch(() => {
        // Token invalid — clear everything
        setToken(null);
        setUser(null);
        setEmployee(null);
        setMustChangePassword(false);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_employee');
        localStorage.removeItem('must_change_password');
      })
      .finally(() => setLoading(false));
  }, [token, mustChangePassword]);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });

    // Check if must change password
    if (res.data.must_change_password) {
      setToken(res.data.token);
      setMustChangePassword(true);
      localStorage.setItem('auth_token', res.data.token);
      localStorage.setItem('must_change_password', 'true');
      return res.data; // Return data so Login can redirect
    }

    const { token: newToken, user: userData, employee: empData } = res.data;

    setToken(newToken);
    setUser(userData);
    setEmployee(empData);
    setMustChangePassword(false);

    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('auth_user', JSON.stringify(userData));
    localStorage.setItem('auth_employee', JSON.stringify(empData));
    localStorage.removeItem('must_change_password');

    return res.data;
  }, []);

  const completePasswordChange = useCallback(async () => {
    // After changing password, fetch user data
    const res = await api.get('/auth/me');
    setUser(res.data.user);
    setEmployee(res.data.employee);
    setMustChangePassword(false);

    localStorage.setItem('auth_user', JSON.stringify(res.data.user));
    localStorage.setItem('auth_employee', JSON.stringify(res.data.employee));
    localStorage.removeItem('must_change_password');
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Even if API call fails, clear local state
    }
    setToken(null);
    setUser(null);
    setEmployee(null);
    setMustChangePassword(false);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_employee');
    localStorage.removeItem('must_change_password');
  }, []);

  return (
    <AuthContext.Provider value={{
      user, employee, token, isAuthenticated, loading,
      mustChangePassword, login, logout, completePasswordChange,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
