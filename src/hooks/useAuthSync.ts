import { useEffect, useState, useCallback, useMemo } from 'react';
import { authUtils } from '@/lib/auth';

export function useAuthSync() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Memoized auth check to prevent unnecessary re-renders
  const checkAuth = useCallback(() => {
    const token = authUtils.getToken();
    const userData = authUtils.getUser();
    const newIsAuthenticated = !!token;
    
    // Only update state if values actually changed
    setIsAuthenticated(prev => {
      if (prev !== newIsAuthenticated) {
        console.log('🔄 Auth state changed:', { was: prev, now: newIsAuthenticated });
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
  }, []);

  useEffect(() => {
    // Initial check
    checkAuth();

    // Listen for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'user') {
        console.log('🔄 Auth sync: Storage changed in another tab', { key: e.key });
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
  
  // For cross-tab sync, we need to modify localStorage
  // This will trigger the storage event in other tabs
  const currentToken = localStorage.getItem('token');
  if (currentToken) {
    localStorage.setItem('token', currentToken);
  } else {
    localStorage.removeItem('token');
  }
}
