import { useState, useEffect, useCallback, useMemo } from 'react';
import { cookieAuthUtils } from '@/lib/cookieAuth';

export function useAuth() {
  const [user, setUser] = useState<null | { id: string; role: 'creator' | 'brand' | 'admin' }>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize user from cookies
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const userData = cookieAuthUtils.getUser();
        if (userData && typeof userData === 'object' && 'id' in userData && 'role' in userData) {
          setUser(userData as { id: string; role: 'creator' | 'brand' | 'admin' });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Memoized auth state
  const authState = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading
  }), [user, isLoading]);

  // Optimized setUser with callback
  const updateUser = useCallback((newUser: typeof user) => {
    setUser(newUser);
    if (newUser) {
      // Update user data in cookies
      try {
        cookieAuthUtils.updateUserData(newUser);
      } catch (error) {
        console.error('Failed to update user data in cookies:', error);
      }
    } else {
      cookieAuthUtils.clearAuth();
    }
  }, []);

  return { 
    ...authState, 
    setUser: updateUser 
  };
}


