'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode, useState } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/login' 
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isOAuthProcessing, setIsOAuthProcessing] = useState(false);

  useEffect(() => {
    // Check if we're processing OAuth success
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const authSuccess = params.get('auth');
      const accessToken = params.get('token');
      
      if (authSuccess === 'success' && accessToken) {
        console.log('OAuth processing detected with token, giving extra time for auth...');
        setIsOAuthProcessing(true);
        
        // Give shorter time for OAuth processing to avoid long waits
        const timer = setTimeout(() => {
          console.log('OAuth processing timeout, stopping wait');
          setIsOAuthProcessing(false);
        }, 1500); // Reduced to 1.5 seconds since we have token
        
        return () => clearTimeout(timer);
      }
    }
  }, []);

  // Clear OAuth processing when authentication is complete
  useEffect(() => {
    if (isAuthenticated && isOAuthProcessing) {
      console.log('Authentication completed, clearing OAuth processing state');
      setIsOAuthProcessing(false);
    }
  }, [isAuthenticated, isOAuthProcessing]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isOAuthProcessing) {
      console.log('Redirecting to login - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated, 'isOAuthProcessing:', isOAuthProcessing);
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, isOAuthProcessing, router, redirectTo]);

  if (isLoading || isOAuthProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {isOAuthProcessing ? 'Processing authentication...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
