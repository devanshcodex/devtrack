'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { authAPI } from '@/services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Rehydrate user from cookie on mount
  useEffect(() => {
    const init = async () => {
      const token = Cookies.get('devtrack_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await authAPI.getMe();
        setUser(res.data.user);
      } catch {
        Cookies.remove('devtrack_token');
        Cookies.remove('devtrack_user');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, user } = res.data;
    Cookies.set('devtrack_token', token, { expires: 7 });
    setUser(user);
    router.push('/dashboard');
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await authAPI.register({ name, email, password });
    const { token, user } = res.data;
    Cookies.set('devtrack_token', token, { expires: 7 });
    setUser(user);
    router.push('/dashboard');
    return res.data;
  };

  const logout = () => {
    Cookies.remove('devtrack_token');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
