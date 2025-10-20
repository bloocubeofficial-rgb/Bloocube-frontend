// pages/analytics.tsx
'use client'
import React, { useEffect, useMemo, useState } from 'react';
import { Line, Pie, Bar } from 'react-chartjs-2';
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
import { cookieAuthUtils } from '@/lib/cookieAuth';

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
  <div className="bg-white rounded-lg p-6 shadow-sm border">
    <div className="flex items-center justify-between mb-2">
      <div className={`p-2 rounded-lg ${color}`}>
        {icon}
      </div>
    </div>
    <div className="space-y-1">
      <p className="text-sm text-gray-800">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
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

  const fetchAnalytics = async () => {
    try {
      setError(null);
      const user = cookieAuthUtils.getUser() as { id?: string; _id?: string; userId?: string } | null;
      const userId =
        user?.id ||
        user?.userId ||
        (cookieAuthUtils as unknown as { getUserId?: () => string }).getUserId?.();
      if (!userId) throw new Error('Not authenticated');
      const res = await apiRequest<{ success: boolean; data: { analytics: AnalyticsItem[] } }>(`/api/analytics/user/${userId}`);
      setAnalytics(res?.data?.analytics || []);
    } catch (e) {
      setError((e as Error).message || 'Failed to load analytics');
      setAnalytics([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

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
    const byDay: Record<string, { likes: number; comments: number; shares: number }> = {};
    dayLabels.forEach(l => (byDay[l] = { likes: 0, comments: 0, shares: 0 }));
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - (rangeDays - 1));
    analytics.forEach(a => {
      const date = a?.timing?.posted_at ? new Date(a.timing.posted_at) : null;
      if (!date || date < cutoff) return;
      const key = `${date.getMonth() + 1}/${date.getDate()}`;
      if (!byDay[key]) return;
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
  }, [analytics, dayLabels, rangeDays]);

  const platformData = useMemo(() => {
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
    const sum = (key: 'likes' | 'comments' | 'shares' | 'views') => analytics.reduce((s, a) => s + (a.metrics?.[key] || 0), 0);
    const totalEngagements = sum('likes') + sum('comments') + sum('shares');
    const avgEngRate = analytics.length ? (((totalEngagements) / Math.max(sum('views'), 1)) * 100).toFixed(1) : '0.0';
    const topPost = [...analytics]
      .map(a => ({
        engagement: (a.metrics?.likes || 0) + (a.metrics?.comments || 0) + (a.metrics?.shares || 0),
        title: a.content?.caption || a.content?.title || a.post_id || 'Post'
      }))
      .sort((a, b) => b.engagement - a.engagement)[0];
    return {
      totalEngagements,
      audienceGrowth: sum('views'),
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

  return (
    <CreatorLayout 
      title="Analytics Dashboard" 
      subtitle="Track your content performance and engagement metrics"
    >
      {/* Page Title */}
      <h2 className="hidden md:block text-2xl font-bold mb-6">Analytics Overview</h2>

      {/* States */}
      {loading && (
        <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
          Loading analytics...
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {!loading && !error && analytics.length === 0 && (
        <div className="mb-4 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
          No analytics available yet. Connect your social accounts and start posting to see insights.
        </div>
      )}

      {/* Date Range Selection */}
      <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border">
        <h3 className="text-sm font-medium mb-2">Data Range Selection</h3>
        <p className="text-xs text-gray-700 mb-3">Select the period for your analytics data</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRangeDays(7)}
            className={`px-3 py-1.5 text-sm rounded-md border ${rangeDays === 7 ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50'}`}
          >7d</button>
          <button
            onClick={() => setRangeDays(30)}
            className={`px-3 py-1.5 text-sm rounded-md border ${rangeDays === 30 ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50'}`}
          >30d</button>
          <button
            onClick={() => setRangeDays(90)}
            className={`px-3 py-1.5 text-sm rounded-md border ${rangeDays === 90 ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50'}`}
          >90d</button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        <MetricCard
          title="Total Engagements"
          value={totals.totalEngagements.toLocaleString()}
          subtitle="Live from your posts"
          color="bg-green-100"
          icon={<span className="text-green-600">💬</span>}
        />
        <MetricCard
          title="Audience Growth"
          value={totals.audienceGrowth.toLocaleString()}
          subtitle="Total views (last 30 days)"
          color="bg-blue-100"
          icon={<span className="text-blue-600">👥</span>}
        />
        <MetricCard
          title="Top Performing Post"
          value={`"${totals.topPostTitle}"`}
          subtitle="Based on total engagement"
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 md:gap-6 mb-6">
        {/* Engagement Trends */}
        <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Engagement Trends</h3>
            <p className="text-sm text-gray-700">Likes, comments and shares over the last {rangeDays} days</p>
          </div>
          <div style={{ height: "250px" }} className="w-full">
            <Line data={engagementData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Bottom Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Platform Breakdown */}
        <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Platform Breakdown</h3>
            <p className="text-sm text-gray-700">Engagement distribution across social media platforms</p>
          </div>
          <div style={{ height: '200px' }} className="w-full">
            <Pie data={platformData} options={pieOptions} />
          </div>
        </div>

        {/* Post Type Performance */}
        <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm border">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Post Type Performance</h3>
            <p className="text-sm text-gray-700">Engagement by post content type</p>
          </div>
          <div style={{ height: '200px' }} className="w-full">
            <Bar data={postTypeData} options={barOptions} />
          </div>
        </div>
      </div>
    </CreatorLayout>
  );
};

export default AnalyticsDashboard;