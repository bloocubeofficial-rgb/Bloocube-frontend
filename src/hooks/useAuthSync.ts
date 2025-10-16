import { useEffect, useState } from 'react';
import { authUtils } from '@/lib/auth';

export function useAuthSync() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    // Initial check
    const checkAuth = () => {
      const token = authUtils.getToken();
      const userData = authUtils.getUser();
      setIsAuthenticated(!!token);
      setUser(userData);
    };

    // Check auth on mount
    checkAuth();

    // Listen for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'user') {
        console.log('🔄 Auth sync: Storage changed in another tab', { key: e.key, newValue: e.newValue });
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
  }, []);

  return { isAuthenticated, user };
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
