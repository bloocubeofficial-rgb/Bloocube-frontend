import { useState, useCallback, useMemo, useEffect } from 'react';
import { authUtils } from '@/lib/auth';

export function useAuthStore() {
  const [token, setToken] = useState<string | null>(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      return authUtils.getToken();
    }
    return null;
  });

  // Memoized token state
  const tokenState = useMemo(() => ({
    token,
    isAuthenticated: !!token
  }), [token]);

  // Listen for auth changes from other tabs
  useEffect(() => {
    const handleAuthChange = () => {
      const currentToken = authUtils.getToken();
      setToken(currentToken);
    };

    window.addEventListener('authChange', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  // Optimized setToken with localStorage sync
  const updateToken = useCallback((newToken: string | null) => {
    setToken(newToken);
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
      authUtils.clearCache(); // Clear auth cache when token is removed
    }
    // Trigger sync across tabs
    authUtils.triggerAuthSync();
  }, []);

  return { 
    ...tokenState, 
    setToken: updateToken 
  };
}


