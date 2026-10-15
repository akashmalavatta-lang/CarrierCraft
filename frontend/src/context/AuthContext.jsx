/**
 * Auth Context: provides user state, login/logout across the app.
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('cc_token');
    const savedUser = localStorage.getItem('cc_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {}
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { access_token, user } = res.data;
    localStorage.setItem('cc_token', access_token);
    localStorage.setItem('cc_user', JSON.stringify(user));
    setUser(user);
    return user;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authAPI.register(data);
    const { access_token, user } = res.data;
    localStorage.setItem('cc_token', access_token);
    localStorage.setItem('cc_user', JSON.stringify(user));
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch {}
    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_user');
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('cc_user', JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
