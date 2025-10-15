'use client';

import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-4">
    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
    <span className="ml-2 text-gray-600">Loading...</span>
  </div>
);

// Lazy load heavy components
export const LazyTwitterIntegration = lazy(() => 
  import('@/Components/Twitter/TwitterIntegration').then(module => ({
    default: module.TwitterIntegration
  }))
);

export const LazyYouTubeIntegration = lazy(() => 
  import('@/Components/YouTube/YouTubeIntegration').then(module => ({
    default: module.YouTubeIntegration
  }))
);

export const LazyLinkedInIntegration = lazy(() => 
  import('@/Components/LinkedIn/LinkedInIntegration').then(module => ({
    default: module.LinkedInIntegration
  }))
);

export const LazyInstagramIntegration = lazy(() => 
  import('@/Components/Instagram/InstagramIntegration').then(module => ({
    default: module.InstagramIntegration
  }))
);

export const LazyFacebookIntegration = lazy(() => 
  import('@/Components/Facebook/FacebookIntegration').then(module => ({
    default: module.FacebookIntegration
  }))
);

export const LazySidebar = lazy(() => 
  import('@/Components/Creater/Sidebar')
);

// Wrapper components with Suspense
export const TwitterIntegrationWithSuspense = (props: Record<string, unknown>) => (
  <Suspense fallback={<LoadingSpinner />}>
    <LazyTwitterIntegration {...props} />
  </Suspense>
);

export const YouTubeIntegrationWithSuspense = (props: Record<string, unknown>) => (
  <Suspense fallback={<LoadingSpinner />}>
    <LazyYouTubeIntegration {...props} />
  </Suspense>
);

export const LinkedInIntegrationWithSuspense = (props: Record<string, unknown>) => (
  <Suspense fallback={<LoadingSpinner />}>
    <LazyLinkedInIntegration {...props} />
  </Suspense>
);

export const InstagramIntegrationWithSuspense = (props: Record<string, unknown>) => (
  <Suspense fallback={<LoadingSpinner />}>
    <LazyInstagramIntegration {...props} />
  </Suspense>
);

export const FacebookIntegrationWithSuspense = (props: Record<string, unknown>) => (
  <Suspense fallback={<LoadingSpinner />}>
    <LazyFacebookIntegration {...props} />
  </Suspense>
);

export const SidebarWithSuspense = (props: Record<string, unknown>) => (
  <Suspense fallback={<LoadingSpinner />}>
    <LazySidebar {...props} />
  </Suspense>
);

// Generic, reusable social integration card to unify UI across providers
export const SocialIntegrationCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  connected: boolean;
  loading: boolean;
  error?: string | null;
  rightArea?: React.ReactNode;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onRefresh?: () => void;
  connectLabel?: string;
  className?: string;
}> = ({ icon, title, connected, loading, error, rightArea, onConnect, onDisconnect, onRefresh, connectLabel = 'Connect', className = '' }) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg gap-3 ${className}`}>
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/60 backdrop-blur">
          {icon}
        </div>
        <div>
          <p className="font-medium text-gray-900">{title}</p>
          {loading ? (
            <p className="text-sm text-gray-500">Checking connection...</p>
          ) : connected ? (
            <p className="text-sm text-green-600">Connected</p>
          ) : (
            <p className="text-sm text-gray-500">Not connected</p>
          )}
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {rightArea ? (
          rightArea
        ) : connected ? (
          <>
            {onRefresh && (
              <button onClick={onRefresh} disabled={loading} className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{loading ? 'Refreshing...' : 'Refresh'}</button>
            )}
            {onDisconnect && (
              <button onClick={onDisconnect} disabled={loading} className="text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm">Disconnect</button>
            )}
          </>
        ) : (
          onConnect && <button onClick={onConnect} disabled={loading} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{loading ? 'Connecting...' : connectLabel}</button>
        )}
      </div>
    </div>
  );
};