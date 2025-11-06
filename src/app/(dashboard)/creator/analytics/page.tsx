// pages/analytics.tsx
'use client'
import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/Components/ui/tabs";
import Engagement30DaysChart from './engagement30DaysChart';
import EngagementChart from "./engagementChart";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';
import CreatorLayout from '@/Components/Creater/CreatorLayout';
import { apiRequest } from '@/lib/apiClient';
import { getUserId } from '@/lib/userUtils';
import { RefreshCw } from 'lucide-react';
import { getFriendlyMessage, ApiError } from '@/lib/errors';
import MonthlyViewsGraph from './monthlyviews';
import PlateformBreakdownChart from './platformBreakdownChart'
import PostTypePerformanceChart from './PostTypeperformanceChart';
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  color: string;
  icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, color, icon }) => (
  <div className="bg-white/80  rounded-sm p-3 shadow-sm border">
    <div className="flex items-center justify-between mb-2">
      <div className={`p-1 rounded-sm ${color}`}>
        {icon}
      </div>
    </div>
    <div className="space-y-1">
      <p className="text-sm text-gray-800">{title}</p>
      <p className="text-sm font-bold">{value}</p>
      <p className="text-xs text-gray-700">{subtitle}</p>
    </div>
  </div>
);

type AnalyticsItem = {
  post_id?: string;
  platform?: string;
  timing?: { posted_at?: string };
  metrics?: { likes?: number; comments?: number; shares?: number; views?: number };
  content?: { media_type?: string; caption?: string; title?: string };
};

const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rangeDays, setRangeDays] = useState<7 | 30 | 90>(30);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const hasSyncedRef = useRef<boolean>(false); // Track if we've synced on initial load
  const lastSyncTimeRef = useRef<number>(0); // Track last sync time to throttle
  const SYNC_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes cooldown between syncs to avoid rate limits
const [platform, setPlatform] = useState("instagram");

  // Sync analytics from linked accounts with throttling to prevent rate limits
  const syncAnalytics = useCallback(async (userId: string, days: number, force = false) => {
    const now = Date.now();
    const timeSinceLastSync = now - lastSyncTimeRef.current;
    
    // Throttle syncs: only allow sync if forced (manual refresh) or if cooldown period has passed
    if (!force && timeSinceLastSync < SYNC_COOLDOWN_MS) {
      const minutesRemaining = Math.ceil((SYNC_COOLDOWN_MS - timeSinceLastSync) / 60000);
      console.log(`⏸️ Sync throttled. Please wait ${minutesRemaining} minute(s) before syncing again.`);
      return; // Skip sync to avoid rate limits
    }

    try {
      lastSyncTimeRef.current = now;
      // Sync analytics from all linked social accounts (Instagram, Twitter, LinkedIn, YouTube, Facebook)
      // Note: This endpoint requires POST method and can trigger rate limits from social media APIs
      await apiRequest<{ success: boolean; data?: { synced: boolean } }>(
        `/api/analytics/user/${userId}/sync?days=${days}&limit=100`,
        { method: 'POST' }
      );
      console.log('✅ Analytics synced from linked accounts');
    } catch (e) {
      // Check if it's a rate limit error
      const err = e as { status?: number; message?: string; retryAfter?: number };
      if (err.status === 429) {
        const retryAfter = err.retryAfter || 60;
        const minutes = Math.ceil(retryAfter / 60);
        console.warn(`⏸️ Rate limit reached. Please try again in ${minutes} minute(s).`);
        // Update last sync time to respect the rate limit
        lastSyncTimeRef.current = now + (retryAfter * 1000);
      } else {
        // Log other sync errors but don't block analytics fetch
        console.warn('Failed to sync analytics from linked accounts:', e);
      }
    }
  }, []);

  // Memoized fetch function that syncs from linked accounts first, then fetches analytics
  const fetchAnalytics = useCallback(async (maxRetries = 2, isManualRefresh = false) => {
    const userId = getUserId();
    if (!userId) {
      setError('Not authenticated');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    // Show refreshing state for manual refreshes
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    // First, sync analytics from linked accounts to get latest engagement data
    // This ensures we're using real-time metrics from Instagram, Twitter, LinkedIn, YouTube, Facebook
    // Only sync on manual refresh or first load to avoid rate limits
    // Throttling: syncs are limited to once per 5 minutes to respect social media API rate limits
    if (isManualRefresh) {
      // Always sync on manual refresh (user explicitly requested)
      await syncAnalytics(userId, rangeDays, true);
      hasSyncedRef.current = true;
    } else if (!hasSyncedRef.current) {
      // Only sync on first load if we haven't synced yet
      await syncAnalytics(userId, rangeDays, false);
      hasSyncedRef.current = true;
    }
    // Don't sync on auto-refresh to avoid rate limits - use cached synced data

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        setError(null);
        // Exponential backoff: 0s, 1s, 2s delays
        if (attempt > 0) {
          await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, attempt - 1), 5000)));
        }
        // Fetch analytics - backend prioritizes synced data from linked accounts
        // This includes engagement metrics from Instagram, Twitter, LinkedIn, YouTube, Facebook
        const res = await apiRequest<{ success: boolean; data: { analytics: AnalyticsItem[] } }>(
          `/api/analytics/user/${userId}?days=${rangeDays}`
        );
        // All analytics come from synced linked accounts data (stored in Analytics collection)
        setAnalytics(res?.data?.analytics || []);
        setLoading(false);
        setRefreshing(false);
        return; // Success - exit early
      } catch (e) {
        if (attempt === maxRetries) {
          // Final attempt failed - use friendly error message
          const errorMessage = e instanceof ApiError 
            ? getFriendlyMessage(e)
            : (e as Error).message || 'Failed to load analytics after retries';
          setError(errorMessage);
          setAnalytics([]);
          setLoading(false);
          setRefreshing(false);
        }
        // Otherwise continue to next retry (with exponential backoff)
      }
    }
  }, [rangeDays, syncAnalytics]); // Sync when rangeDays changes

  // Refetch when rangeDays changes or on mount
  // Note: We don't reset sync flag on rangeDays change to avoid excessive syncs
  // The backend already filters by date range, so we can use existing synced data
  useEffect(() => {
    fetchAnalytics(2, false);
    // Increase auto-refresh interval to 5 minutes (300000ms) to avoid rate limits
    // Analytics data doesn't need to be refreshed every 30 seconds
    const interval = setInterval(() => fetchAnalytics(2, false), 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, [fetchAnalytics]); // Now includes rangeDays dependency through fetchAnalytics

  // Manual refresh handler
  const handleRefresh = useCallback(() => {
    fetchAnalytics(2, true);
  }, [fetchAnalytics]);

  // Build day labels for selected range
  const dayLabels = useMemo(() => {
    const labels: string[] = [];
    const now = new Date();
    for (let i = rangeDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      labels.push(`${d.getMonth() + 1}/${d.getDate()}`);
    }
    return labels;
  }, [rangeDays]);

  const engagementData = useMemo(() => {
    // Calculate engagement trends from synced linked accounts data
    // All metrics (likes, comments, shares) come from Instagram, Twitter, LinkedIn, YouTube, Facebook
    const byDay: Record<string, { likes: number; comments: number; shares: number }> = {};
    dayLabels.forEach(l => (byDay[l] = { likes: 0, comments: 0, shares: 0 }));
    
    // Process analytics items from synced linked accounts (filtered by backend by date range)
    analytics.forEach(a => {
      const date = a?.timing?.posted_at ? new Date(a.timing.posted_at) : null;
      if (!date) return;
      const key = `${date.getMonth() + 1}/${date.getDate()}`;
      if (!byDay[key]) return;
      // Aggregate engagement metrics from all linked social accounts
      byDay[key].likes += a.metrics?.likes || 0;
      byDay[key].comments += a.metrics?.comments || 0;
      byDay[key].shares += a.metrics?.shares || 0;
    });
    return {
      labels: dayLabels,
      datasets: [
        {
          label: 'Likes',
          data: dayLabels.map(l => byDay[l]?.likes || 0),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: 'Comments',
          data: dayLabels.map(l => byDay[l]?.comments || 0),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: 'Shares',
          data: dayLabels.map(l => byDay[l]?.shares || 0),
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
        }
      ]
    };
  }, [analytics, dayLabels]);

  const platformData = useMemo(() => {
    // Platform breakdown from linked accounts (Instagram, Twitter, LinkedIn, YouTube, Facebook)
    const counts: Record<string, number> = {};
    analytics.forEach(a => {
      const p = String(a.platform || '').toLowerCase();
      counts[p] = (counts[p] || 0) + 1;
    });
    const labels = Object.keys(counts).map(n => n.charAt(0).toUpperCase() + n.slice(1));
    const data = Object.values(counts);
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: ['#E1306C','#1877F2','#1DA1F2','#0077B5','#FF0000','#3B82F6','#10B981','#F59E0B'],
          borderWidth: 0
        }
      ]
    };
  }, [analytics]);

  const postTypeData = useMemo(() => {
    // Post type performance from linked accounts data
    const counts: Record<string, number> = {};
    analytics.forEach(a => {
      const t = String(a.content?.media_type || 'unknown');
      counts[t] = (counts[t] || 0) + 1;
    });
    const labels = Object.keys(counts).map(n => n.charAt(0).toUpperCase() + n.slice(1));
    const data = Object.values(counts);
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: '#3B82F6',
          borderRadius: 4
        }
      ]
    };
  }, [analytics]);

  const totals = useMemo(() => {
    // Calculate totals from synced linked accounts data (Instagram, Twitter, LinkedIn, YouTube, Facebook)
    // All metrics come from real-time engagement data synced from social platforms
    const sum = (key: 'likes' | 'comments' | 'shares' | 'views') => 
      analytics.reduce((s, a) => s + (a.metrics?.[key] || 0), 0);
    
    const totalEngagements = sum('likes') + sum('comments') + sum('shares');
    const totalViews = sum('views');
    const avgEngRate = analytics.length ? (((totalEngagements) / Math.max(totalViews, 1)) * 100).toFixed(1) : '0.0';
    
    // Find top performing post from linked accounts based on total engagement
    // Engagement = likes + comments + shares (from synced social platforms)
    const topPost = [...analytics]
      .map(a => {
        const engagement = (a.metrics?.likes || 0) + (a.metrics?.comments || 0) + (a.metrics?.shares || 0);
        const platform = a.platform || 'Unknown';
        const title = a.content?.caption || a.content?.title || a.post_id || 'Post';
        const truncatedTitle = title.length > 50 ? title.substring(0, 50) + '...' : title;
        return {
          engagement,
          title: `${truncatedTitle} (${platform})`,
          platform,
          postId: a.post_id
        };
      })
      .sort((a, b) => b.engagement - a.engagement)[0];
    
    return {
      totalEngagements,
      audienceGrowth: totalViews, // Total views from linked accounts
      topPostTitle: topPost?.title || '—',
      avgEngagementRate: avgEngRate
    };
  }, [analytics]);


// chart options with correct typing
const chartOptions: import("chart.js").ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: "bottom",
      labels: {
        usePointStyle: true,
        padding: 20,
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: "#333",
      },
    },
    y: {
      grid: {
        display: true,
      },
      ticks: {
        color: "#333",
      },
    },
  },
};
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
        }
      }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        }
      },
      y: {
        grid: {
          color: '#F3F4F6',
        },
        beginAtZero: true,
      }
    }
  };



  const sampleData = [
  { date: "Day 1", likes: 10, shares: 5, comments: 5 },
  { date: "Day 2", likes: 20, shares: 8, comments: 12 },
  { date: "Day 3", likes: 5, shares: 3, comments: 7 },
  { date: "Day 4", likes: 30, shares: 10, comments: 20 },
  // ... continue till Day 30
];
  return (
    <CreatorLayout 
      title="Analytics Dashboard" 
      subtitle="Track your content performance and engagement metrics"
    >
      {/* Page Title */}
      {/* <h2 className="hidden md:block text-2xl font-bold mb-6 text-gray-200">Analytics Overview</h2> */}

      {/* States */}
      {loading && (
        <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
          Loading analytics...
        </div>
      )}
      {error && (
        <div className={`mb-4 rounded-md border px-3 py-2 text-sm ${
          error.toLowerCase().includes('rate limit') || error.toLowerCase().includes('too many requests') || error.toLowerCase().includes('429')
            ? 'border-yellow-200 bg-yellow-50 text-yellow-800'
            : 'border-red-200 bg-red-50 text-red-700'
        }`}>
          <div className="flex items-start gap-2">
            <span>⚠️</span>
            <div className="flex-1">
              <p className="font-medium">{error}</p>
              {(error.toLowerCase().includes('rate limit') || error.toLowerCase().includes('too many requests') || error.toLowerCase().includes('429')) && (
                <p className="text-xs mt-1 opacity-90">
                  Analytics are synced from linked social accounts. To avoid rate limits, syncs are limited to once every 5 minutes. 
                  Use the Refresh button to force a sync when needed.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      {!loading && !error && analytics.length === 0 && (
        <div className="mb-4 rounded-md border border-orange-700 bg-orange-50  px-3 py-2 text-sm text-orange-700">
          No analytics available yet. Connect your social accounts and start posting to see insights.
        </div>
      )}

      {/* Date Range Selection with Refresh */}
      <div className="bg-white/80  rounded-sm p-3 md:p-4 mb-6 hover:shadow-sm border border-gray-200/100">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-medium mb-1">Data Range Selection</h3>
            <p className="text-xs text-gray-700">Select the period for your analytics data</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs md:text-sm rounded-md border transition-colors ${
              loading || refreshing
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
            }`}
            title="Refresh analytics data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setRangeDays(7)}
            disabled={loading || refreshing}
            className={`px-3 py-1.5 text-xs md:text-sm rounded-md border transition-colors ${
              rangeDays === 7 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
            } ${loading || refreshing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >7d</button>
          <button
            onClick={() => setRangeDays(30)}
            disabled={loading || refreshing}
            className={`px-3 py-1.5 text-xs md:text-sm rounded-md border transition-colors ${
              rangeDays === 30 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
            } ${loading || refreshing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >30d</button>
          <button
            onClick={() => setRangeDays(90)}
            disabled={loading || refreshing}
            className={`px-3 py-1.5 text-xs md:text-sm rounded-md border transition-colors ${
              rangeDays === 90 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
            } ${loading || refreshing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >90d</button>
        </div>
      </div>

      
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        <MetricCard
          title="Total Engagements"
          value={totals.totalEngagements.toLocaleString()}
          subtitle="From linked accounts (Instagram, Twitter, LinkedIn, YouTube, Facebook)"
          color="bg-green-200"
          icon={<span className="text-green-600">💬</span>}
        />
        <MetricCard
          title="Audience Growth"
          value={totals.audienceGrowth.toLocaleString()}
          subtitle={`Total views from linked accounts (last ${rangeDays} days)`}
          color="bg-blue-100"
          icon={<span className="text-blue-600">👥</span>}
        />
        <MetricCard
          title="Top Performing Post"
          value={`"${totals.topPostTitle}"`}
          subtitle="Highest engagement from linked accounts"
          color="bg-yellow-100"
          icon={<span className="text-yellow-600">⭐</span>}
        />
        <MetricCard
          title="Avg. Engagement Rate"
          value={`${totals.avgEngagementRate}%`}
          subtitle="Engagement vs views"
          color="bg-purple-100"
          icon={<span className="text-purple-600">📊</span>}
        />
      </div>
<div className="w-full">
  <Tabs value={platform} onValueChange={setPlatform}>
    {/* 🔹 Tabs Header (Right aligned) */}
    <div className="flex justify-end mb-6">
      <TabsList className="flex flex-wrap gap-2">
        <TabsTrigger value="instagram">Instagram</TabsTrigger>
        <TabsTrigger value="youtube">YouTube</TabsTrigger>
        <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
        <TabsTrigger value="twitter">Twitter (X)</TabsTrigger>
      </TabsList>
    </div>

    {/* 🔹 First Row */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Chart 1 */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-sm p-2  hover:shadow-md transition-shadow duration-200 bg-white dark:bg-gray-900">
        <TabsContent value="instagram">
          <EngagementChart activePlatform="instagram" />
        </TabsContent>
        <TabsContent value="youtube">
          <EngagementChart activePlatform="youtube" />
        </TabsContent>
        <TabsContent value="linkedin">
          <EngagementChart activePlatform="linkedin" />
        </TabsContent>
        <TabsContent value="twitter">
          <EngagementChart activePlatform="twitter" />
        </TabsContent>
      </div>

      {/* Chart 2 */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-sm p-2  hover:shadow-md transition-shadow duration-200 bg-white dark:bg-gray-900">
        <TabsContent value="instagram">
          <MonthlyViewsGraph platform="instagram" />
        </TabsContent>
        <TabsContent value="youtube">
          <MonthlyViewsGraph platform="youtube" />
        </TabsContent>
        <TabsContent value="linkedin">
          <MonthlyViewsGraph platform="linkedin" />
        </TabsContent>
        <TabsContent value="twitter">
          <MonthlyViewsGraph platform="twitter" />
        </TabsContent>
      </div>
    </div>

    {/* 🔹 Second Row (Single Chart Centered) */}
    <div className="border border-gray-200 dark:border-gray-800 rounded-sm p-3  hover:shadow-md transition-shadow duration-200 bg-white dark:bg-gray-900 mb-6">
      <TabsContent value="instagram">
        <Engagement30DaysChart platform="instagram" />
      </TabsContent>
      <TabsContent value="youtube">
        <Engagement30DaysChart platform="youtube" />
      </TabsContent>
      <TabsContent value="linkedin">
        <Engagement30DaysChart platform="linkedin" />
      </TabsContent>
      <TabsContent value="twitter">
        <Engagement30DaysChart platform="twitter" />
      </TabsContent>
    </div>

    {/* 🔹 Third Row */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Chart 4 - Platform Breakdown */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-sm p-2 hover:shadow-md transition-shadow duration-200 bg-white dark:bg-gray-900">
        <TabsContent value="instagram">
          <PlateformBreakdownChart platform="instagram" />
        </TabsContent>
        <TabsContent value="youtube">
          <PlateformBreakdownChart platform="youtube" />
        </TabsContent>
        <TabsContent value="linkedin">
          <PlateformBreakdownChart platform="linkedin" />
        </TabsContent>
        <TabsContent value="twitter">
          <PlateformBreakdownChart platform="twitter" />
        </TabsContent>
      </div>

      {/* Chart 5 - Post Type Performance */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-sm p-2 hover:shadow-md transition-shadow duration-200 bg-white dark:bg-gray-900">
        <TabsContent value="instagram">
          <PostTypePerformanceChart platform="instagram" />
        </TabsContent>
        <TabsContent value="youtube">
          <PostTypePerformanceChart platform="youtube" />
        </TabsContent>
        <TabsContent value="linkedin">
          <PostTypePerformanceChart platform="linkedin" />
        </TabsContent>
        <TabsContent value="twitter">
          <PostTypePerformanceChart platform="twitter" />
        </TabsContent>
      </div>
    </div>
  </Tabs>
</div>


      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 md:gap-6 mb-6">
        {/* Engagement Trends */}
        {/* <div className="bg-white/80  rounded-sm p-3 md:p-6 shadow-sm border border-gray-200/100 hover:shadow:sm">
          <div className="mb-4">
            <h3 className="text-base md:text-lg font-semibold">Engagement Trends</h3>
            <p className="text-xs md:text-sm text-gray-700">Likes, comments and shares over the last {rangeDays} days</p>
          </div>
          <div style={{ height: "250px" }} className="w-full">
            <Line data={engagementData} options={chartOptions} />
          </div>
        </div> */}
      </div>

      {/* Bottom Charts */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Platform Breakdown */}
        {/* <div className="rounded-sm p-3 md:p-6 shadow-sm border border-gray-200/100 hover:shadow:sm">
          <div className="mb-4">
            <h3 className="text-base md:text-lg font-semibold">Platform Breakdown</h3>
            <p className="text-xs md:text-sm text-gray-700">Engagement distribution across social media platforms</p>
          </div>
          <div style={{ height: '200px' }} className="w-full">
            <Pie data={platformData} options={pieOptions} />
          </div>
        </div> */}

        {/* Post Type Performance */}
        {/* <div className="rounded-sm p-3 md:p-6 shadow-sm border border-gray-200/100 hover:shadow:sm">
          <div className="mb-4">
            <h3 className="text-base md:text-lg font-semibold">Post Type Performance</h3>
            <p className="text-xs md:text-sm text-gray-700">Engagement by post content type</p>
          </div>
          <div style={{ height: '200px' }} className="w-full">
            <Bar data={postTypeData} options={barOptions} />
          </div>
        </div> */}
      </div>
       <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Social Media Analytics</h1>
      </div>
      
    </CreatorLayout>
  );
};

export default AnalyticsDashboard;