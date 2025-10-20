"use client";

import React, { useState, useEffect } from 'react';
import { notificationService } from '@/lib/notificationService';

export function NotificationTest() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testNotificationAPI = async () => {
    setIsLoading(true);
    addResult('Testing notification API...');
    
    try {
      // Test 1: Test unread count
      addResult('Testing unread count...');
      const unreadResponse = await notificationService.getUnreadCount();
      addResult(`Unread count response: ${JSON.stringify(unreadResponse)}`);

      // Test 2: Test notifications list
      addResult('Testing notifications list...');
      const notificationsResponse = await notificationService.getNotifications({ limit: 5 });
      addResult(`Notifications response: ${JSON.stringify(notificationsResponse)}`);

    } catch (error) {
      addResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Notification test error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="fixed bottom-4 left-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md z-50">
      <h3 className="font-bold text-sm mb-2">Notification API Test</h3>
      <div className="space-y-2">
        <button
          onClick={testNotificationAPI}
          disabled={isLoading}
          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test API'}
        </button>
        <button
          onClick={clearResults}
          className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
        >
          Clear
        </button>
        <div className="max-h-32 overflow-y-auto text-xs">
          {testResults.map((result, index) => (
            <div key={index} className="text-gray-600">{result}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
