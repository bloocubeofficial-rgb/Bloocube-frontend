"use client";

import React, { useState, useEffect } from 'react';
import { cookieAuthUtils } from '@/lib/cookieAuth';
import { useAuth } from '@/hooks/useAuth';

export function AuthMultiTabTest() {
  const { isAuthenticated, user } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testAuthSync = () => {
    addTestResult('Testing auth sync...');
    const testUser = { id: 'test-user', name: 'Test User', role: 'creator' } as any;
    cookieAuthUtils.updateUserData(testUser);
    cookieAuthUtils.triggerAuthSync();
    addTestResult('User data set - check other tabs for sync');
  };

  const testLogout = () => {
    addTestResult('Testing logout...');
    cookieAuthUtils.clearAuth();
    addTestResult('Auth cleared - check other tabs for sync');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  useEffect(() => {
    const userName = (user as any)?.name || user?.id || 'None';
    addTestResult(`Tab loaded - Auth: ${isAuthenticated ? 'Yes' : 'No'}, User: ${userName}`);
  }, [isAuthenticated, user]);

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md z-50">
      <h3 className="font-bold text-sm mb-2">Multi-Tab Auth Test</h3>
      <div className="space-y-2">
        <div className="text-xs">
          <strong>Status:</strong> {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
        </div>
        <div className="text-xs">
          <strong>User:</strong> {(user as any)?.name || user?.id || 'None'}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={testAuthSync}
            className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          >
            Test Login
          </button>
          <button
            onClick={testLogout}
            className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
          >
            Test Logout
          </button>
          <button
            onClick={clearResults}
            className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
          >
            Clear
          </button>
        </div>
        <div className="max-h-32 overflow-y-auto text-xs">
          {testResults.map((result, index) => (
            <div key={index} className="text-gray-600">{result}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
