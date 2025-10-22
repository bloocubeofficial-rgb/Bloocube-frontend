"use client";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuth();

  // Require auth for creator routes - only check when not loading
  useEffect(() => {
    if (typeof window === 'undefined' || isLoading) {
      console.log('🔍 Creator layout: Skipping auth check', { isLoading, isServer: typeof window === 'undefined' });
      return;
    }
    
    const isCreator = user?.role === 'creator';
    console.log('🔍 Creator layout auth check:', { 
      isAuthenticated, 
      isCreator, 
      userRole: user?.role,
      userId: user?.id,
      user: user
    });
    
    if (!isAuthenticated || !isCreator) {
      console.log('🚫 Creator auth check failed, redirecting to login', { isAuthenticated, isCreator, userRole: user?.role });
      router.replace('/login');
    } else {
      console.log('✅ Creator auth check passed');
    }
  }, [isAuthenticated, user, router, isLoading]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated or not a creator user
  if (!isAuthenticated || user?.role !== 'creator') {
    return null;
  }

  return <>{children}</>;
}
