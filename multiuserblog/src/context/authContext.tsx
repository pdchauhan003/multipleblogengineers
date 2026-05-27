/* eslint-disable react-hooks/immutability */
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/api/axios';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'visitor' | 'creator';
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password?: string;
  role?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (nameOrData: string | RegisterPayload, email?: string, password?: string, role?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      // The Axios interceptor automatically handles 401 token refresh and retries seamlessly!
      const res = await api.get('/auth/me');
      setUser(res.data.user);
    } catch {
      // 401 is expected when user is not logged in — silently clear the user state
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      setUser(res.data.user);
      router.push('/dashboard');
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Login failed';
      return { success: false, error: errorMsg };
    }
  };

  const register = async (
    nameOrData: string | RegisterPayload,
    email?: string,
    password?: string,
    role?: string
  ) => {
    try {
      let payload: RegisterPayload;
      if (typeof nameOrData === 'object' && nameOrData !== null) {
        payload = nameOrData;
      } else {
        payload = { name: nameOrData as string, email: email || '', password, role };
      }

      const res = await api.post('/auth/register', payload);
      setUser(res.data.user);
      router.push('/dashboard');
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Registration failed';
      return { success: false, error: errorMsg };
    }
  };

  const logout = async () => {
    try {
      await api.delete('/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
