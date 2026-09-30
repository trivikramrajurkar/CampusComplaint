import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem('campus_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await authService.getMe();
      setUser(res.data.user);
    } catch {
      localStorage.removeItem('campus_token');
      localStorage.removeItem('campus_user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = (token, userData) => {
    localStorage.setItem('campus_token', token);
    localStorage.setItem('campus_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('campus_token');
    localStorage.removeItem('campus_user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    refreshUser: fetchMe,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
