/**
 * Auth Context: provides user state, login/logout across the app.
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for unauthorized events to update auth state without hard page reload
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener('cc_auth_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('cc_auth_unauthorized', handleUnauthorized);
  }, []);

  // Restore session from localStorage on mount, or auto-initialize valid demo session
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const token = localStorage.getItem('cc_token');
      const savedUser = localStorage.getItem('cc_user');

      if (token && savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (isMounted) setUser(parsed);

          // Verify token in background
          try {
            const meRes = await authAPI.me();
            if (meRes.data?.user && isMounted) {
              setUser(meRes.data.user);
              localStorage.setItem('cc_user', JSON.stringify(meRes.data.user));
            }
            if (isMounted) setLoading(false);
            return;
          } catch {
            // Token expired or invalid, clear and obtain fresh demo token below
            localStorage.removeItem('cc_token');
            localStorage.removeItem('cc_user');
          }
        } catch {}
      }

      // Auto-authenticate with demo user so dashboard and all tools are immediately operable
      try {
        const res = await authAPI.login({
          email: 'demo@careercraft.io',
          password: 'Password123!'
        });
        const { access_token, user: apiUser } = res.data;
        localStorage.setItem('cc_token', access_token);
        localStorage.setItem('cc_user', JSON.stringify(apiUser));
        if (isMounted) setUser(apiUser);
      } catch {
        // If login failed (e.g. fresh DB before seeding), register demo user
        try {
          const regRes = await authAPI.register({
            name: 'Akash Malavatta',
            email: 'demo@careercraft.io',
            password: 'Password123!',
            target_role: 'AI / Data Science Engineer',
            experience_level: 'fresher'
          });
          const { access_token, user: regUser } = regRes.data;
          localStorage.setItem('cc_token', access_token);
          localStorage.setItem('cc_user', JSON.stringify(regUser));
          if (isMounted) setUser(regUser);
        } catch {
          const defaultUser = {
            id: 1,
            name: 'Akash Malavatta',
            email: 'demo@careercraft.io',
            target_role: 'AI / Data Science Engineer',
            experience_level: 'fresher',
            location: 'Bengaluru, Karnataka, India'
          };
          if (isMounted) setUser(defaultUser);
          localStorage.setItem('cc_user', JSON.stringify(defaultUser));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
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
