/**
 * Auth Context: provides user state, login/logout across the app.
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

const DEFAULT_USER = {
  id: 1,
  name: 'Akash Malavatta',
  email: 'demo@careercraft.io',
  target_role: 'AI / Data Science Engineer',
  experience_level: 'fresher',
  location: 'Bengaluru, Karnataka, India'
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem('cc_token');
      const saved = localStorage.getItem('cc_user');
      if (token && saved) return JSON.parse(saved);
    } catch {}
    return null;
  });
  const [loading, setLoading] = useState(true);

  // Auto-clear session when unauthorized
  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem('cc_token');
      localStorage.removeItem('cc_user');
      setUser(null);
    };
    window.addEventListener('cc_auth_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('cc_auth_unauthorized', handleUnauthorized);
  }, []);

  // Restore authenticated session from localStorage on mount
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const token = localStorage.getItem('cc_token');
      const savedUser = localStorage.getItem('cc_user');

      if (token && savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (isMounted) setUser(parsed);

          // Verify token against backend
          try {
            const meRes = await authAPI.me();
            if (meRes.data?.user && isMounted) {
              setUser(meRes.data.user);
              localStorage.setItem('cc_user', JSON.stringify(meRes.data.user));
            }
          } catch {
            // Token expired or invalid
            localStorage.removeItem('cc_token');
            localStorage.removeItem('cc_user');
            if (isMounted) setUser(null);
          }
        } catch {
          localStorage.removeItem('cc_token');
          localStorage.removeItem('cc_user');
          if (isMounted) setUser(null);
        }
      } else {
        if (isMounted) setUser(null);
      }

      if (isMounted) setLoading(false);
    };

    initAuth();
    return () => { isMounted = false; };
  }, []);


  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { access_token, user } = res.data;
    localStorage.setItem('cc_token', access_token);
    localStorage.setItem('cc_user', JSON.stringify(user));
    setUser(user);
    return user;
  }, []);

  const loginWithGoogle = useCallback(async (googleData = {}) => {
    const res = await authAPI.google(googleData);
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
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
