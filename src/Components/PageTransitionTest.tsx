"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export function PageTransitionTest() {
  const [renderCount, setRenderCount] = useState(0);
  const [lastRender, setLastRender] = useState<Date | null>(null);

  useEffect(() => {
    setRenderCount(prev => prev + 1);
    setLastRender(new Date());
    console.log('🔄 PageTransitionTest rendered:', { count: renderCount + 1, time: new Date().toISOString() });
  });

  return (
    <div className="p-4 border rounded-lg bg-yellow-50">
      <h3 className="text-lg font-semibold mb-4">Page Transition Test</h3>
      <div className="space-y-2">
        <p><strong>Render Count:</strong> {renderCount}</p>
        <p><strong>Last Render:</strong> {lastRender?.toLocaleTimeString()}</p>
        <div className="flex gap-2">
          <Link href="/brand" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Go to Brand
          </Link>
          <Link href="/brand/campaigns" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            Go to Campaigns
          </Link>
          <Link href="/brand/analytics" className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
            Go to Analytics
          </Link>
        </div>
        <p className="text-sm text-gray-600">
          Navigate between pages and watch the render count. It should NOT increase on every navigation.
        </p>
      </div>
    </div>
  );
}
