// LinkedInIntegration.tsx
"use client";
import React, { forwardRef, useImperativeHandle, useEffect } from 'react';
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
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg gap-3 ${className}`}>
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <span className="text-blue-600 font-medium text-sm">in</span>
        </div>
        <div>
          <p className="font-medium text-gray-900">LinkedIn</p>
          <p className={`text-sm ${isConnected ? 'text-green-600' : 'text-gray-500'}`}>
            {getStatusText()}
          </p>
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {isConnected ? (
          <>
            <button
              onClick={checkConnectionStatus}
              disabled={loading}
              className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={handleDisconnect}
              disabled={loading}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Disconnecting...' : 'Disconnect'}
            </button>
          </>
        ) : (
          <button
            onClick={handleConnect}
            disabled={loading}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Connecting...' : 'Connect'}
          </button>
        )}
      </div>
    </div>
  );
});

LinkedInIntegration.displayName = 'LinkedInIntegration';