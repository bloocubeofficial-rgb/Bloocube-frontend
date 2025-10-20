import { useState, useCallback, useMemo, useEffect } from 'react';
import { cookieAuthUtils } from '@/lib/cookieAuth';

export function useAuthStore() {
  const [user, setUser] = useState<any | null>(() => {
    // Initialize from cookies if available
    if (typeof window !== 'undefined') {
      return cookieAuthUtils.getUser();
    }
    return null;
  });

  // Memoized auth state
  const authState = useMemo(() => ({
    user,
    isAuthenticated: !!user
  }), [user]);

  // Listen for auth changes from other tabs
  useEffect(() => {
    const handleAuthChange = () => {
      const currentUser = cookieAuthUtils.getUser();
      // Only update if user actually changed
      setUser((prev: Record<string, unknown> | null) => {
        if (prev !== currentUser) {
          console.log('🔄 User changed in auth store:', { was: prev ? 'exists' : 'null', now: currentUser ? 'exists' : 'null' });
          return currentUser as any;
        }
        return prev;
      });
    };

    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  // Optimized setUser with cookie sync
  const updateUser = useCallback((newUser: any | null) => {
    setUser(newUser);
    if (newUser) {
      cookieAuthUtils.updateUserData(newUser);
    } else {
      cookieAuthUtils.clearAuth();
    }
    // Trigger sync across tabs
    window.dispatchEvent(new CustomEvent('authChange'));
  }, []);

  return { 
    ...authState, 
    setUser: updateUser 
  };
}


