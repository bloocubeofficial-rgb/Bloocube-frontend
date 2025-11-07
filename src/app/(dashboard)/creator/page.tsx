"use client";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Brush,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";

import EngagementCarousel from "./engagementCrousel";
import {
  Plus,
  Eye,
  User,
  TrendingUp,
  Calendar,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  ThumbsUp,
  MessageSquare,
  Share2,
  TrendingDown,
} from "lucide-react";
import CreatorLayout from "@/Components/Creater/CreatorLayout";
import { apiRequest } from "@/lib/apiClient";
import { cookieAuthUtils } from "@/lib/cookieAuth";
import { persistentCache } from "@/lib/cache";
import { getFriendlyMessage } from "@/lib/errors";

import Link from "next/link";
import RecentPosts from "./posts/recentpost";
import Scheduled from "./posts/scheduled";
type AnalyticsItem = {
  post_id?: string;
  platform?: string;
  timing?: { posted_at?: string };
  metrics?: {
    likes?: number;
    comments?: number;
    shares?: number;
    views?: number;
    reach?: number;
    impressions?: number;
    followers?: number;
    engagement_rate?: number;
  };
  content?: { media_type?: string; caption?: string };
};

const Dashboard = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<number>(0);
  const [scheduledCount, setScheduledCount] = useState<number>(0);
  const [totalPostsCount, setTotalPostsCount] = useState<number>(0);

  // Local cache keys and helpers
  const ANALYTICS_CACHE_KEY = 'creator_dashboard_analytics_v1';
  const COUNTS_CACHE_KEY = 'creator_dashboard_counts_v1';
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  const loadAnalyticsCache = () => {
    const cached = persistentCache.getFresh<{ data: AnalyticsItem[]; ts: number }>(ANALYTICS_CACHE_KEY);
    if (cached && Array.isArray(cached.data)) {
      setAnalytics(cached.data);
      setLastUpdated(cached.ts);
    }
  };

  const saveAnalyticsCache = (data: AnalyticsItem[]) => {
    persistentCache.set(ANALYTICS_CACHE_KEY, { data, ts: Date.now() }, CACHE_TTL);
  };

  const loadCountsCache = () => {
    const cached = persistentCache.getFresh<{ total: number; scheduled: number; ts: number }>(COUNTS_CACHE_KEY);
    if (cached) {
      setTotalPostsCount(cached.total || 0);
      setScheduledCount(cached.scheduled || 0);
    }
  };

  const saveCountsCache = (total: number, scheduled: number) => {
    persistentCache.set(COUNTS_CACHE_KEY, { total, scheduled, ts: Date.now() }, CACHE_TTL);
  };

  // Formatting helpers
  const formatNumber = (n: number) => n.toLocaleString();
  const formatCompact = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(n);

  const fetchAnalytics = useCallback(async (options?: { sync?: boolean; showLoading?: boolean }) => {
    try {
      setError(null);
      if (options?.showLoading) setLoading(true);

      const user = cookieAuthUtils.getUser() as {
        id?: string;
        _id?: string;
        userId?: string;
      } | null;
      const userId =
        user?.id ||
        user?._id ||
        user?.userId ||
        (cookieAuthUtils as unknown as { getUserId?: () => string }).getUserId?.();
      if (!userId) throw new Error("Not authenticated");

      // Optionally sync from linked social accounts before fetching
      if (options?.sync) {
        try {
          await apiRequest<{ success: boolean; data?: { synced: boolean } }>(
            `/api/analytics/user/${userId}/sync`,
            { method: "POST" }
          );
        } catch {}
      }
      const reqInit: RequestInit = options?.showLoading
        ? { headers: { 'X-Show-Loading': '1' } as any }
        : {};
      const res = await apiRequest<{
        success: boolean;
        data: { analytics: AnalyticsItem[] };
      }>(`/api/analytics/user/${userId}`, reqInit);
      setAnalytics(res?.data?.analytics || []);
      setLastUpdated(Date.now());
      saveAnalyticsCache(res?.data?.analytics || []);
    } catch (e) {
      setError(getFriendlyMessage(e));
      setAnalytics([]);
    } finally {
      if (options?.showLoading) setLoading(false);
    }
  }, []);

  const fetchPostCounts = useCallback(async () => {
    try {
      // Get total posts count with minimal payload
      const totalRes = await apiRequest<{
        success: boolean;
        pagination?: { total?: number };
      }>(`/api/posts?limit=1`);
      const scheduledRes = await apiRequest<{
        success: boolean;
        pagination?: { total?: number };
      }>(`/api/posts?status=scheduled&limit=1`);
      setTotalPostsCount(totalRes?.pagination?.total || 0);
      setScheduledCount(scheduledRes?.pagination?.total || 0);
      saveCountsCache(totalRes?.pagination?.total || 0, scheduledRes?.pagination?.total || 0);
    } catch (e) {
      // Non-fatal for dashboard; keep previous values
      console.warn("Failed to load post counts", e);
    }
  }, []);

  useEffect(() => {
    // Load from cache first for instant UI (optimistic loading)
    loadAnalyticsCache();
    loadCountsCache();
    
    // Then fetch fresh data from server
    fetchAnalytics({ sync: false, showLoading: false });
    fetchPostCounts();

    // Listen for post changes to refresh dashboard data
    const handlePostCreated = () => {
      // Clear cache and refresh
      persistentCache.remove('creator_dashboard_analytics_v1');
      persistentCache.remove('creator_dashboard_counts_v1');
      fetchAnalytics({ sync: false, showLoading: false });
      fetchPostCounts();
    };
    const handlePostDeleted = () => {
      persistentCache.remove('creator_dashboard_counts_v1');
      fetchPostCounts();
    };

    window.addEventListener('postCreated', handlePostCreated);
    window.addEventListener('postDeleted', handlePostDeleted);
    window.addEventListener('postUpdated', handlePostCreated);

    return () => {
      window.removeEventListener('postCreated', handlePostCreated);
      window.removeEventListener('postDeleted', handlePostDeleted);
      window.removeEventListener('postUpdated', handlePostCreated);
    };
  }, [fetchAnalytics, fetchPostCounts]);

  const engagementData = useMemo(() => {
    const byMonth: Record<
      string,
      { likes: number; comments: number; shares: number }
    > = {};
    analytics.forEach((a) => {
      const d = a?.timing?.posted_at
        ? new Date(a.timing.posted_at)
        : new Date();
      const key = `${d.getMonth() + 1}/${String(d.getFullYear()).slice(-2)}`;
      if (!byMonth[key]) byMonth[key] = { likes: 0, comments: 0, shares: 0 };
      byMonth[key].likes += a?.metrics?.likes || 0;
      byMonth[key].comments += a?.metrics?.comments || 0;
      byMonth[key].shares += a?.metrics?.shares || 0;
    });
    return Object.entries(byMonth).map(([month, v]) => ({ month, ...v }));
  }, [analytics]);

  const viewsByMonth = useMemo(() => {
    const byMonth: Record<string, { views: number }> = {};
    analytics.forEach((a) => {
      const d = a?.timing?.posted_at
        ? new Date(a.timing.posted_at)
        : new Date();
      const key = `${d.getMonth() + 1}/${String(d.getFullYear()).slice(-2)}`;
      if (!byMonth[key]) byMonth[key] = { views: 0 };
      byMonth[key].views += a?.metrics?.views || 0;
    });
    return Object.entries(byMonth).map(([month, v]) => ({ month, ...v }));
  }, [analytics]);

  const platformData = useMemo(() => {
    const colors: Record<string, string> = {
      instagram: "#E1306C",
      facebook: "#1877F2",
      twitter: "#1DA1F2",
      linkedin: "#0077B5",
      youtube: "#FF0000",
    };
    const counts: Record<string, number> = {};
    analytics.forEach((a) => {
      const p = String(a.platform || "").toLowerCase();
      counts[p] = (counts[p] || 0) + 1;
    });
    return Object.entries(counts).map(([name, posts]) => ({
      name,
      posts,
      color: colors[name] || "#999999",
    }));
  }, [analytics]);

  const topPosts = useMemo(() => {
    return [...analytics]
      .map((a) => ({
        id: a.post_id || "",
        thumbnail: a.content?.media_type === "video" ? "🎥" : "📸",
        content: a.content?.caption || a.post_id || "",
        platform: (a.platform || "").toString(),
        engagement: String(
          (a.metrics?.likes || 0) +
            (a.metrics?.comments || 0) +
            (a.metrics?.shares || 0)
        ),
        platformColor:
          a.platform === "instagram"
            ? "#E1306C"
            : a.platform === "facebook"
            ? "#1877F2"
            : a.platform === "twitter"
            ? "#1DA1F2"
            : a.platform === "linkedin"
            ? "#0077B5"
            : a.platform === "youtube"
            ? "#FF0000"
            : "#999999",
      }))
      .sort((p1, p2) => parseInt(p2.engagement) - parseInt(p1.engagement))
      .slice(0, 5);
  }, [analytics]);

  const totals = useMemo(() => {
    const sum = (key: "likes" | "comments" | "shares" | "views") =>
      analytics.reduce((s, a) => s + (a.metrics?.[key] || 0), 0);
    const sumReach = analytics.reduce((s, a) => s + (a.metrics?.reach || 0), 0);
    const sumImpressions = analytics.reduce(
      (s, a) => s + (a.metrics?.impressions || 0),
      0
    );
    const sumFollowers = analytics.reduce(
      (s, a) => s + (a.metrics?.followers || 0),
      0
    );
    const engagementNumerator = sum("likes") + sum("comments") + sum("shares");
    const engagementDenominator = Math.max(
      sum("views") || sumReach || sumImpressions || sumFollowers || 0,
      1
    );
    return {
      totalPosts: totalPostsCount,
      scheduledPosts: scheduledCount,
      engagementRate: analytics.length
        ? ((engagementNumerator / engagementDenominator) * 100).toFixed(1)
        : "0.0",
      avgEngagementScore: analytics.length
        ? Math.round(
            (sum("likes") + sum("comments") * 2 + sum("shares") * 3) /
              analytics.length
          )
        : 0,
      lastUpdated,
      sums: {
        views: sum("views"),
        likes: sum("likes"),
        comments: sum("comments"),
        shares: sum("shares"),
      },
    };
  }, [analytics, lastUpdated, totalPostsCount, scheduledCount]);

  const headerActions = (
    <>
      <button
        onClick={() => {
          fetchAnalytics({ sync: true, showLoading: true });
          fetchPostCounts();
        }}
        disabled={loading}
        className="flex bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm items-center space-x-2 px-3 py-1.5 text-gray-600 hover:text-white-900 hover:bg-gray-100 rounded-md transition-colors"
      >
        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        <span className="text-sm">Refresh</span>
      </button>
      {/* <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm px-2 py-1.5 rounded-sm flex items-center space-x-2 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow hover:shadow-md text-sm">
        <Plus className="w-4 h-4" />
        <span className="font-medium">Create Post</span>
      </button> */}
      {/* <div className="w-8 h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
        <User className="w-4 h-4 text-gray-600" />
      </div> */}
    </>
  );

  return (
    <CreatorLayout
      title="Creator Dashboard"
      subtitle="Welcome back! Here's your content overview"
      headerActions={headerActions}
    >
      {/* Loading and Error States */}
      {loading && (
        <div className="bg-white/80 backdrop-blur-sm rounded-sm p-6 mb-6 border border-gray-200/50 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-gray-600 font-medium">
              Loading your analytics...
            </span>
          </div>
        </div>
      )}

      {!!error && (
        <div className="bg-red-50/80 backdrop-blur-sm text-red-700 rounded-sm p-6 mb-6 border border-red-200/50 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-sm">!</span>
            </div>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="flex flex-col lg:flex-row justify-between ">
           <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <Calendar className="w-4 h-4" />
            <span>
              Last updated: {new Date(totals.lastUpdated).toLocaleTimeString()}
            </span>
          </div>
        <div>
   <Link href="/creator/posts">
  <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-sm text-white px-4 py-2.5 rounded-sm flex items-center space-x-1 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md">
    <Plus className="w-4 h-4" />
    <span>Create New Post</span>
  </button>
</Link>
        </div>
        </div>
        </>

      )}
      
    

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-9">
{/* Total Posts */}
<Card className="rounded-sm  hover:shadow-md transition-all duration-200  border border-gray-200/04 ">
  <CardContent className="p-3">
    <div className="flex justify-between items-start mb-1">
      <div>
        <p className="text-xs text-gray-500 font-medium">Total Posts</p>
        <p className="text-2xl font-semibold text-gray-900 mt-1">{totals.totalPosts}</p>
      </div>

      <div className="w-10 h-10 bg-green-100 rounded-md flex items-center justify-center">
        <Target className="w-5 h-5 text-green-600" />
      </div>
    </div>
    <div className="flex items-center text-green-600 text-xs font-sm mt-1">
      <TrendingUp className="w-3 h-3 mr-1" />
      +12.5% from last month
    </div>
  </CardContent>
</Card>

{/* Scheduled Posts */}

<Card className="rounded-sm  hover:shadow-md transition-all duration-200 border border-gray-200/04 ">
  <CardContent className="p-3">
    
    <div className="flex justify-between items-start mb-1">
      <div>
        <p className="text-xs text-gray-500 font-medium">Scheduled Posts</p>
        <p className="text-2xl font-semibold text-gray-900 mt-1">{totals.scheduledPosts}</p>
      </div>
      <div className="w-10 h-10 bg-green-100 rounded-md flex items-center justify-center">
        <Calendar className="w-5 h-5 text-green-600" />
      </div>
    </div>
    <div className="flex items-center text-green-600 text-xs font-sm mt-1">
      <TrendingUp className="w-3 h-3 mr-1" />
   +5% From last month
    </div>
  </CardContent>
</Card>

{/* Engagement Rate */}
     <EngagementCarousel />

{/* Avg Engagement Score */}
 <Card className="rounded-sm  hover:shadow-md transition-all duration-200 border border-gray-200/04 ">
  <CardContent className="p-3">
    <div className="flex justify-between items-start mb-1">
      <div>
        <p className="text-xs text-gray-500 font-medium">Avg. Engagement Score</p>
        <p className="text-2xl font-semibold text-gray-900 mt-1">{totals.avgEngagementScore}</p>
      </div>
      <div className="w-10 h-10 bg-green-100 rounded-md flex items-center justify-center">
      <Zap className="w-5 h-5 text-green-600" />
      </div>
    </div>
    <div className="flex items-center text-red-600 text-xs font-sm mt-1">
    <TrendingDown className="w-3 h-3 mr-1" />
   -3% From last month
    </div>
  </CardContent>
</Card>

</div>
      
      {/* recent post  and scheduling post */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<div>
 <RecentPosts />
</div>
<div>
<Scheduled />
</div>
</div>

     
      {/* KPI Cards: Views, Likes, Comments, Shares */}
   

      {/* Enhanced Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 mt-8">
        {/* Engagement Trends */}
        {/* <div  className="rounded-sm  bg-card text-card-foreground flex flex-col gap-6  border py-6  p-4  hover:shadow-md transition-all duration-200  border border-gray-200/04">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Engagement Trends
              </h3>
              <p className="text-sm text-gray-500">Performance over time</p>
            </div>
            <div className="w-10 h-10 bg-blue-200 rounded-md flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-800" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart
              data={
                engagementData.length
                  ? engagementData
                  : [{ month: "", likes: 0, comments: 0, shares: 0 }]
              }
              margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#666" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#666" }}
                tickFormatter={(v) =>
                  new Intl.NumberFormat("en-IN", {
                    notation: "compact",
                    maximumFractionDigits: 1,
                  }).format(Number(v))
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value) => [
                  new Intl.NumberFormat("en-IN").format(Number(value)),
                  "",
                ]}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="likes"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: "#3B82F6", strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5 }}
                name="Likes"
              />
              <Line
                type="monotone"
                dataKey="comments"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: "#10B981", strokeWidth: 2, r: 2.5 }}
                activeDot={{ r: 5 }}
                name="Comments"
              />
              <Line
                type="monotone"
                dataKey="shares"
                stroke="#EF4444"
                strokeWidth={2}
                dot={{ fill: "#EF4444", strokeWidth: 2, r: 2.5 }}
                activeDot={{ r: 5 }}
                name="Shares"
              />
              <Brush
                dataKey="month"
                height={18}
                stroke="#cbd5e1"
                travellerWidth={8}
              />
            </LineChart>
          </ResponsiveContainer>
        </div> */}

        {/* Views by Month */}
       {/* <div  className="rounded-sm  bg-card text-card-foreground flex flex-col gap-6  border py-6  p-4  hover:shadow-md transition-all duration-200  border border-gray-200/04">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Views by Month
              </h3>
              <p className="text-sm text-gray-500">
                Total views across content
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-200  rounded-md flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-800" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={
                viewsByMonth.length ? viewsByMonth : [{ month: "", views: 0 }]
              }
              margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#666" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#666" }}
                tickFormatter={(v) =>
                  new Intl.NumberFormat("en-IN", {
                    notation: "compact",
                    maximumFractionDigits: 1,
                  }).format(Number(v))
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value) => [
                  new Intl.NumberFormat("en-IN").format(Number(value)),
                  "Views",
                ]}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar
                dataKey="views"
                name="Views"
                fill="#60A5FA"
                radius={[8, 8, 0, 0]}
                isAnimationActive
              />
              <Brush
                dataKey="month"
                height={18}
                stroke="#cbd5e1"
                travellerWidth={8}
              />
            </BarChart>
          </ResponsiveContainer>
        </div> */}
      </div>

      {/* Enhanced Top Performing Posts */}
      {/* <div  className="rounded-sm  p-4 shadow-md hover:shadow-md transition-all duration-200 bg-white/80 border border-gray-200/50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Top Performing Posts
            </h3>
            <p className="text-sm text-gray-500">
              Your best content this month
            </p>
          </div>
          <div className="w-10 h-10 bg-green-200 rounded-md flex items-center justify-center">
            <Zap className="w-5 h-5 text-green-800" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-700">
                  Content
                </th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">
                  Platform
                </th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">
                  Engagement
                </th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {topPosts.map((post) => (
                <tr
                  key={post.id}
                  className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-2xl">
                        {post.thumbnail}
                      </div>
                      <div className="max-w-md">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">
                          {post.content}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className="px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-sm"
                      style={{ backgroundColor: post.platformColor }}
                    >
                      {post.platform}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gray-900">
                        {post.engagement}
                      </span>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md">
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div> */}
    </CreatorLayout>
  );
};

export default Dashboard;
