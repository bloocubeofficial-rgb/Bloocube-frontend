// LinkedInIntegration.tsx
"use client";
import React, { forwardRef, useImperativeHandle, useEffect } from 'react';
import { SocialIntegrationCard } from '@/Components/LazyComponents';
import { useLinkedIn } from '@/hooks/useLinkedIn';

interface LinkedInIntegrationProps {
  className?: string;
}

export interface LinkedInIntegrationRef {
  checkConnection: () => void;
}

export const LinkedInIntegration = forwardRef<LinkedInIntegrationRef, LinkedInIntegrationProps>(({ className = '' }, ref) => {
  const { connect, getProfile, disconnect, isConnected, profile, loading, error } = useLinkedIn();

  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    // This function now just triggers the hook's getProfile method.
    // The component will automatically re-render with the new state.
    await getProfile();
  };

  const handleConnect = async () => {
    try {
      await connect();
    } catch (err) {
      console.error('LinkedIn connection error:', err);
    }
  };
  
  const handleDisconnect = async () => {
    await disconnect();
  };

  // Expose checkConnection method to the parent component
  useImperativeHandle(ref, () => ({
    checkConnection: checkConnectionStatus
  }));

  // FIX: Derive display text directly from the hook's state (profile, isConnected).
  // This removes the need for local 'connectionStatus' state.
  const getStatusText = () => {
    if (loading) return 'Checking...';
    if (isConnected && profile) {
      return `Connected as ${profile.name || `${profile.firstName || ''} ${profile.lastName || ''}`.trim()}`;
    }
    return 'Not Connected';
  };

  return (
    <SocialIntegrationCard
      className={className}
      icon={<span className="text-blue-600 font-medium text-sm">in</span>}
      title="LinkedIn"
      connected={Boolean(isConnected && profile)}
      loading={loading}
      error={error || undefined}
      onConnect={handleConnect}
      onDisconnect={handleDisconnect}
      onRefresh={checkConnectionStatus}
      connectLabel="Connect LinkedIn"
      profileName={profile ? `@${profile.username || profile.name || `${profile.firstName || ''} ${profile.lastName || ''}`.trim()}` : undefined}
      profileDetail={profile?.headline || profile?.industry}
    />
  );
});

LinkedInIntegration.displayName = 'LinkedInIntegration';