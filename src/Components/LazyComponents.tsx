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
