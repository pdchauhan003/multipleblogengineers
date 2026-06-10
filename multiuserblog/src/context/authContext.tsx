/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/immutability */
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/api/axios';
import { GoogleOAuthProvider } from '@react-oauth/google';

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
  forgot: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (nameOrData: string | RegisterPayload, email?: string, password?: string, role?: string) => Promise<{ success: boolean; error?: string }>;
  googleLogin: (token: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkUser: () => Promise<void>;
  sendMail: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [forgot, setForgot] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      setForgot(false);
      const res = await api.get('/auth/me');
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setForgot(false);
      const res = await api.post('/auth/login', { email, password });

      if (res.data.forgot) {
        setForgot(true);
        return { success: false, error: 'forgot' };
      }

      await checkUser();
      return { success: true };

    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Login failed';
      setForgot(err.response?.data?.forgot === true);
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

      await api.post('/auth/register', payload);
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Registration failed';
      return { success: false, error: errorMsg };
    }
  };

  const googleLogin = async (token: string) => {
    try {
      await api.post('/auth/google', { token });
      await checkUser();
      return { success: true };
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Google Sign-In failed';
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

  const sendMail = async (email: string) => {
    try {
      const res = await api.post('/auth/send-mail', { email });
      return { success: true, message: res.data?.message || 'OTP sent successfully' };
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to send OTP email';
      console.error('Forgot password failed:', errorMsg);
      return { success: false, error: errorMsg };
    }
  }

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'dummy-client-id.apps.googleusercontent.com';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, googleLogin, logout, checkUser, forgot, sendMail }}>
      <GoogleOAuthProvider clientId={googleClientId}>
        {children}
      </GoogleOAuthProvider>
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
