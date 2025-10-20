"use client";

import React, { useState, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';

export function NotificationDebugger() {
  const { user, isAuthenticated } = useAuth();
  const {
    notifications,
    loading,
    error,
    unreadCount,
    unreadCountError
  } = useNotifications({
    limit: 5,
    autoRefresh: true,
    refreshInterval: 10000
  });

  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    setDebugInfo({
      isAuthenticated,
      userId: user?.id,
      userRole: user?.role,
      notificationsCount: notifications.length,
      unreadCount,
      loading,
      error,
      unreadCountError,
      notifications: notifications.slice(0, 3), // Show first 3 notifications
      timestamp: new Date().toISOString()
    });
  }, [isAuthenticated, user, notifications, unreadCount, loading, error, unreadCountError]);

  return (
    <div className="fixed top-4 left-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md z-50">
      <h3 className="font-bold text-sm mb-2">Notification Debug Info</h3>
      <div className="text-xs space-y-1">
        <div><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</div>
        <div><strong>User ID:</strong> {user?.id || 'None'}</div>
        <div><strong>User Role:</strong> {user?.role || 'None'}</div>
        <div><strong>Notifications:</strong> {notifications.length}</div>
        <div><strong>Unread Count:</strong> {unreadCount}</div>
        <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
        <div><strong>Error:</strong> {error || 'None'}</div>
        <div><strong>Unread Error:</strong> {unreadCountError || 'None'}</div>
        <div><strong>Last Update:</strong> {debugInfo.timestamp}</div>
      </div>
      <div className="mt-2">
        <h4 className="font-semibold text-xs">Raw Data:</h4>
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>
    </div>
  );
}
