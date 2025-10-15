'use client';
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { useTwitter } from '@/hooks/useTwitter';
import { Loader2, CheckCircle, ExternalLink } from 'lucide-react';
import { SocialIntegrationCard } from '@/Components/LazyComponents';

interface TwitterIntegrationProps {
  className?: string;
}

export interface TwitterIntegrationRef {
  checkConnection: () => void;
}

export const TwitterIntegration = forwardRef<TwitterIntegrationRef, TwitterIntegrationProps>(({ className = '' }, ref) => {
  const { isConnected, profile, loading, error, connect, disconnect, checkConnection } = useTwitter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Expose checkConnection method to parent component
  useImperativeHandle(ref, () => ({
    checkConnection
  }));

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      await connect();
      // After successful connection, check the status to update UI
      setTimeout(() => {
        checkConnection();
      }, 1000);
    } catch (error) {
      console.error('Twitter connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsDisconnecting(true);
      await disconnect();
    } catch (error) {
      console.error('Twitter disconnection error:', error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  // Note: Removed automatic checkConnection() call to prevent 429 errors
  // Connection status will be checked only when user manually clicks connect/disconnect

  return (
    <SocialIntegrationCard
      className={className}
      icon={<span className="text-black font-medium text-sm">X</span>}
      title="X (Twitter)"
      connected={Boolean(isConnected && profile)}
      loading={loading || isConnecting || isDisconnecting}
      error={error || undefined}
      onConnect={handleConnect}
      onDisconnect={handleDisconnect}
      onRefresh={checkConnection}
      connectLabel="Connect Twitter"
      profileName={profile ? `@${profile.username}` : undefined}
      profileDetail={profile?.name}
    />
  );
});

TwitterIntegration.displayName = 'TwitterIntegration';
