"use client";
import React, { createContext, useContext, useMemo } from 'react';
import { useAuthSync } from '@/hooks/useAuthSync';

interface AuthContextType {
  isAuthenticated: boolean;
  user: Record<string, unknown> | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const authData = useAuthSync();

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => authData, [authData.isAuthenticated, authData.user, authData.isLoading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
