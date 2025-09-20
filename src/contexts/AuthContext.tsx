'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
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

  const setClientAuthCookie = (enabled: boolean) => {
    if (typeof document === 'undefined') return;
    if (enabled) {
      document.cookie = 'client_auth=1; path=/; SameSite=Lax';
    } else {
      document.cookie = 'client_auth=; Max-Age=0; path=/; SameSite=Lax';
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Starting auth check...');
        
        // Check for OAuth success and token in URL
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          const authSuccess = params.get('auth');
          const accessToken = params.get('token');
          
          if (authSuccess === 'success' && accessToken) {
            console.log('OAuth success with token detected');
            (api.defaults.headers.common as any)['Authorization'] = `Bearer ${accessToken}`;
            setClientAuthCookie(true);
            
            // Clean URL
            const url = new URL(window.location.href);
            url.searchParams.delete('auth');
            url.searchParams.delete('token');
            window.history.replaceState({}, '', url.toString());
            
            // Fetch profile with OAuth token
            try {
              console.log('Fetching user profile with OAuth token...');
              const response = await api.get('/auth/profile');
              setUser(response.data.user);
              setClientAuthCookie(true);
              console.log('Profile fetch successful:', response.data.user);
            } catch (error) {
              console.log('Profile fetch failed even with OAuth token:', error);
              setUser(null);
              setClientAuthCookie(false);
            }
          } else {
            // No OAuth token, check for existing session
            console.log('No OAuth token, checking for existing session...');
            
            // Check if we already have an Authorization header set
            const existingAuth = api.defaults.headers.common['Authorization'];
            if (existingAuth) {
              console.log('Found existing auth header, trying profile...');
              try {
                const response = await api.get('/auth/profile');
                setUser(response.data.user);
                setClientAuthCookie(true);
                console.log('Profile fetch successful with existing token');
              } catch (error) {
                console.log('Profile failed with existing token, clearing auth');
                setUser(null);
                setClientAuthCookie(false);
                delete api.defaults.headers.common['Authorization'];
              }
            } else {
              // No authentication available
              console.log('No authentication found, user needs to login');
              setUser(null);
              setClientAuthCookie(false);
            }
          }
        } else {
          // Server-side rendering or no window
          setUser(null);
          setClientAuthCookie(false);
        }
        
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
        setClientAuthCookie(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const accessToken = response.data?.accessToken;
      if (accessToken) {
        (api.defaults.headers.common as any)['Authorization'] = `Bearer ${accessToken}`;
      }
      
      const userResponse = await api.get('/auth/profile');
      setUser(userResponse.data.user);
      setClientAuthCookie(true);
    } catch (error: any) {
      setClientAuthCookie(false);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const signup = async (data: SignupData) => {
    try {
      const response = await api.post('/auth/signup', data);
      const accessToken = response.data?.accessToken;
      if (accessToken) {
        (api.defaults.headers.common as any)['Authorization'] = `Bearer ${accessToken}`;
      }
      
      const userResponse = await api.get('/auth/profile');
      setUser(userResponse.data.user);
      setClientAuthCookie(true);
    } catch (error: any) {
      setClientAuthCookie(false);
      throw new Error(error.response?.data?.message || 'Signup failed');
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setClientAuthCookie(false);
      delete (api.defaults.headers.common as any)['Authorization'];
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
