import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { api, getErrorMessage } from '../lib/api';
import { User } from '../types';

interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  roomNumber: string;
  residence?: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      setUser(res.data.user);
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  };

  const register = async (data: RegisterInput) => {
    try {
      const res = await api.post('/auth/register', data);
      setUser(res.data.user);
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  };

  const logout = async () => {
    await api.post('/auth/logout').catch(() => undefined);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
