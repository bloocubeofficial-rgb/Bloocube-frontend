import React, { useState, forwardRef, useImperativeHandle } from "react";
import { ExternalLink, Loader2, Play } from "lucide-react";
import { SocialIntegrationCard } from '@/Components/LazyComponents';
import { useYouTube } from "@/hooks/useYouTube";

interface YouTubeIntegrationProps {
  className?: string;
}

export interface YouTubeIntegrationRef {
  checkConnection: () => void;
}

export const YouTubeIntegration = forwardRef<YouTubeIntegrationRef, YouTubeIntegrationProps>(({ className = '' }, ref) => {
  const { isConnected, channel, loading, error, connect, disconnect, checkConnection } = useYouTube();
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
      console.error('YouTube connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsDisconnecting(true);
      await disconnect();
    } catch (error) {
      console.error('YouTube disconnection error:', error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  // Note: Removed automatic checkConnection() call to prevent 429 errors
  // Connection status will be checked only when user manually clicks connect/disconnect

  return (
    <SocialIntegrationCard
      className={className}
      icon={<Play className="w-4 h-4 text-red-600" />}
      title="YouTube"
      connected={Boolean(isConnected && channel)}
      loading={loading || isConnecting || isDisconnecting}
      error={error || undefined}
      onConnect={handleConnect}
      onDisconnect={handleDisconnect}
      onRefresh={checkConnection}
      connectLabel="Connect YouTube"
      rightArea={undefined}
    />
  );
});

YouTubeIntegration.displayName = 'YouTubeIntegration';
