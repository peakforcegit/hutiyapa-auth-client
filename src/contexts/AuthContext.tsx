'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/services/api';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

interface SignupData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we have a stored token first
        const storedToken = localStorage.getItem('accessToken');
        
        // If redirected from OAuth with accessToken in URL, capture and set it
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          const urlToken = params.get('accessToken');
          if (urlToken) {
            localStorage.setItem('accessToken', urlToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${urlToken}`;
            const url = new URL(window.location.href);
            url.searchParams.delete('accessToken');
            window.history.replaceState({}, '', url.toString());
          } else if (storedToken) {
            // Use stored token if no URL token
            api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          }
        } else if (storedToken) {
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }

        // Only make API call if we have a token
        const hasToken = storedToken || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('accessToken'));
        if (hasToken) {
          const response = await api.get('/users/profile');
          setUser(response.data);
        } else {
          setUser(null);
        }
      } catch (error) {
        // Token is invalid or expired
        console.log('Auth check failed, clearing stored token');
        localStorage.removeItem('accessToken');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken } = response.data;
      
      // Store access token in localStorage
      localStorage.setItem('accessToken', accessToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      // Get user profile
      const userResponse = await api.get('/users/profile');
      setUser(userResponse.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const signup = async (data: SignupData) => {
    try {
      const response = await api.post('/auth/signup', data);
      const { accessToken } = response.data;
      
      // Store access token in localStorage
      localStorage.setItem('accessToken', accessToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      // Get user profile
      const userResponse = await api.get('/users/profile');
      setUser(userResponse.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Signup failed');
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Even if logout fails on server, clear local state
      console.error('Logout error:', error);
    } finally {
      // Clear local state
      localStorage.removeItem('accessToken');
      setUser(null);
      delete api.defaults.headers.common['Authorization'];
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await api.post('/auth/forgot', { email });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send reset email');
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      await api.post('/auth/reset', { token, password });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Password reset failed');
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
