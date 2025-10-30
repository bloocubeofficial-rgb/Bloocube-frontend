import { useEffect, useState, useCallback, useMemo } from 'react';
import { cookieAuthUtils } from '@/lib/cookieAuth';
import { apiRequest } from '@/lib/apiClient';

export function useAuthSync() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Memoized auth check to prevent unnecessary re-renders
  const checkAuth = useCallback(() => {
    try {
      const userData = cookieAuthUtils.getUser();
      const newIsAuthenticated = cookieAuthUtils.isAuthenticated();
      
      // Enhanced debugging for authentication issues
      if (!userData && !newIsAuthenticated) {
        console.warn('🔍 No authentication data found:', {
          hasUserData: !!userData,
          isAuthenticated: newIsAuthenticated,
          cookies: typeof document !== 'undefined' ? document.cookie : 'SSR'
        });
      }
      
      // Only update state if values actually changed
      setIsAuthenticated(prev => {
        if (prev !== newIsAuthenticated) {
          console.log('🔄 Auth state changed:', { was: prev, now: newIsAuthenticated, userData });
          return newIsAuthenticated;
        }
        return prev;
      });
      
      setUser(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(userData)) {
          console.log('🔄 User data changed:', { was: prev, now: userData });
          return userData;
        }
        return prev;
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('❌ Error checking authentication:', error);
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial check
    checkAuth();

    // Optional server validation to prevent stale/tampered user_data
    // Only run if we think user is authenticated from cookies
    (async () => {
      try {
        const hasUser = cookieAuthUtils.isAuthenticated();
        if (!hasUser) return;
        const me = await apiRequest<{ success: boolean; data?: { user?: Record<string, unknown> } }>(
          '/api/auth/me',
          { method: 'GET' }
        );
        if (me?.data?.user) {
          // Reconcile cookie with server truth
          cookieAuthUtils.updateUserData(me.data.user);
          setUser(me.data.user);
          setIsAuthenticated(true);
        }
      } catch (e) {
        // If server says unauthorized, clear local auth
        console.warn('Auth server validation failed, clearing local state');
        setIsAuthenticated(false);
        setUser(null);
        cookieAuthUtils.clearAuth();
      }
    })();

    // Listen for storage changes from other tabs (for user data cookie)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user_data') {
        console.log('🔄 Auth sync: User data changed in another tab', { key: e.key });
        checkAuth();
      }
    };

    // Listen for custom auth events (for same-tab updates)
    const handleAuthChange = () => {
      console.log('🔄 Auth sync: Custom auth event received');
      checkAuth();
    };

    // Add event listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleAuthChange);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, [checkAuth]);

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(() => ({
    isAuthenticated,
    user,
    isLoading
  }), [isAuthenticated, user, isLoading]);
}

// Helper function to trigger auth sync across tabs
export function triggerAuthSync() {
  // Dispatch custom event for same-tab updates
  window.dispatchEvent(new CustomEvent('authChange'));
  
  // For cross-tab sync with cookies, we can't modify HttpOnly cookies
  // The server will handle cookie synchronization
  console.log('🔄 Auth sync triggered (server handles cookie sync)');
}
