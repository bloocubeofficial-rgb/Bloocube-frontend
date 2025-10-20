"use client";

import React, { useState } from 'react';

export function APITest() {
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (result: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testAPI = async () => {
    setIsLoading(true);
    addResult('Starting API test...');
    
    try {
      // Test API base URL
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      addResult(`API Base: ${apiBase}`);

      // Test notifications endpoint
      const url = `${apiBase}/api/notifications`;
      addResult(`Testing: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      addResult(`Response Status: ${response.status}`);
      addResult(`Response OK: ${response.ok}`);
      
      if (response.ok) {
        const data = await response.json();
        addResult(`Success: ${JSON.stringify(data, null, 2)}`);
      } else {
        const errorText = await response.text();
        addResult(`Error: ${errorText}`);
      }

    } catch (error) {
      addResult(`❌ Exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-lg z-50">
      <h3 className="font-bold text-sm mb-2">API Test</h3>
      <div className="space-y-2">
        <button
          onClick={testAPI}
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
        <div className="max-h-64 overflow-y-auto text-xs">
          {results.map((result, index) => (
            <div key={index} className="text-gray-600">{result}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
