import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const defaultAuthContext = {
  user: null,
  loading: false,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  loginWithGoogle: async () => ({ success: false }),
  logout: async () => ({ success: false }),
  restoreSession: async () => ({ success: false }),
  isAuthenticated: false,
};

const AuthContext = createContext(defaultAuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback(async (payload) => {
    const response = await api.post('/auth/login', payload);
    setUser(response.data?.data || null);
    return response.data;
  }, []);

  const register = useCallback(async (payload) => {
    const response = await api.post('/auth/register', payload);
    setUser(response.data?.data || null);
    return response.data;
  }, []);

  const loginWithGoogle = useCallback(async (token) => {
    const response = await api.post('/auth/google', { token });
    setUser(response.data?.data || null);
    return response.data;
  }, []);

  const logout = useCallback(async () => {
    await api.post('/auth/logout');
    setUser(null);
  }, []);

  const restoreSession = useCallback(async () => {
    try {
      const response = await api.get('/auth/session');
      setUser(response.data?.data || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check for Google OAuth token in URL (Native Redirect Flow)
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      if (accessToken) {
        window.history.replaceState(null, '', window.location.pathname); // Clean URL
        loginWithGoogle(accessToken).then(() => {
          // Successfully logged in via redirect
        }).catch(err => {
          console.error("Google login failed", err);
        });
      }
    }

    restoreSession();
  }, [loginWithGoogle, restoreSession]);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      loginWithGoogle,
      logout,
      restoreSession,
      isAuthenticated: Boolean(user),
    }),
    [user, loading, login, register, loginWithGoogle, logout, restoreSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
