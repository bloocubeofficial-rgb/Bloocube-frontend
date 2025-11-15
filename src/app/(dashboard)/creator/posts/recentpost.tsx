"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Avatar, AvatarFallback } from "@/Components/ui/avatar";
import { Button } from "@/Components/ui/Button";
import { 
  Instagram, 
  Facebook, 
  Linkedin,
  Twitter,
  Youtube,
  Eye,
  Clock,
  Loader2,
  Heart,
  MessageCircle,
  Share2,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/apiClient";
import { getUserId } from "@/lib/userUtils";
import Link from "next/link";

interface Post {
  _id: string;
  title?: string;
  content?: string | { text?: string; caption?: string };
  platform: string;
  status: 'published' | 'scheduled' | 'failed' | 'draft';
  analytics?: {
    views?: number;
    likes?: number;
    shares?: number;
    comments?: number;
    clicks?: number;
  };
  publishing?: {
    published_at?: string;
    platform_post_id?: string;
    platform_url?: string;
  };
  createdAt?: string;
}

interface AnalyticsItem {
  post_id?: string;
  platform?: string;
  metrics?: {
    likes?: number;
    comments?: number;
    shares?: number;
    views?: number;
    reach?: number;
    impressions?: number;
  };
}

const platformIcons: Record<string, any> = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  twitter: Twitter,
  youtube: Youtube,
};

const platformColors: Record<string, string> = {
  instagram: 'text-pink-600',
  facebook: 'text-blue-700',
  linkedin: 'text-blue-500',
  twitter: 'text-blue-400',
  youtube: 'text-red-600',
};

const statusColors = {
  published: "bg-green-100 text-green-700 border border-green-300",
  scheduled: "bg-blue-100 text-blue-700 border border-blue-300",
  failed: "bg-red-100 text-red-700 border border-red-300",
  draft: "bg-gray-100 text-gray-700 border border-gray-300",
};

const formatTimeAgo = (dateString?: string) => {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

const RecentPosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analyticsMap, setAnalyticsMap] = useState<Record<string, AnalyticsItem>>({});
  const lastFetchTimeRef = useRef(0);

  const fetchData = useCallback(async (syncAnalytics = false, showInitialLoading = true, force = false) => {
    // Basic throttling for non-forced requests (apiClient handles deduplication)
    const now = Date.now();
    if (!force && !showInitialLoading && now - lastFetchTimeRef.current < 3000) {
      return; // Too soon since last fetch
    }

    try {
      lastFetchTimeRef.current = now;
      if (showInitialLoading) setLoading(true);
      setRefreshing(true);
      
      // OPTIMIZATION: Fetch posts in parallel with analytics for faster loading
      const userId = getUserId();
      
      // Fetch published posts from the Bloocube platform only
      const postsRes = await apiRequest<{ posts: Post[]; pagination: any }>(
        "/api/posts?status=published&limit=5&sort=recent"
      );
      const fetchedPosts = postsRes.posts || [];
      setPosts(fetchedPosts);

      // Analytics will be fetched below if userId exists

      if (userId) {
        // Sync analytics from platforms first if requested
        if (syncAnalytics) {
          try {
            await apiRequest<{ success: boolean }>(`/api/analytics/user/${userId}/sync`, {
              method: 'POST'
            });
          } catch (err) {
            console.warn("Failed to sync analytics:", err);
          }
        }

        // Fetch fresh analytics with retry logic
        const fetchAnalyticsWithRetry = async (maxRetries = 2): Promise<AnalyticsItem[]> => {
          for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
              if (attempt > 0) {
                // Exponential backoff: 1s, 2s
                await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, attempt - 1), 5000)));
              }
              const analyticsRes = await apiRequest<{
                success: boolean;
                data: { analytics: AnalyticsItem[] };
              }>(`/api/analytics/user/${userId}`);
              return analyticsRes?.data?.analytics || [];
            } catch (error) {
              if (attempt === maxRetries) {
                console.error("Failed to fetch analytics after retries:", error);
                return [];
              }
            }
          }
          return [];
        };

        try {
          const analytics = await fetchAnalyticsWithRetry();
          
          // Create a map of analytics by post_id (can be platform_post_id or post _id)
          // Support multiple key formats for matching (string, ObjectId, etc.)
          const map: Record<string, AnalyticsItem> = {};
          analytics.forEach((item) => {
            if (item.post_id) {
              const postId = String(item.post_id); // Normalize to string
              // Store by post_id for direct lookup
              map[postId] = item;
              // Also store by original format if different (handle ObjectId and other types)
              if (typeof item.post_id !== 'string') {
                const originalId = String(item.post_id);
                if (originalId !== postId) {
                  map[originalId] = item;
                }
              }
            }
          });
          setAnalyticsMap(map);
        } catch (error) {
          console.error("Failed to process analytics:", error);
          // Continue without analytics
        }
      }
    } catch (error) {
      console.error("Failed to fetch published posts:", error);
      setPosts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []); // Empty dependency array - function is stable

  const handleRefresh = async () => {
    await fetchData(true, false, true); // Sync analytics when manually refreshing, force update
  };

  useEffect(() => {
    fetchData(false, true); // Initial load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const getPostAnalytics = (post: Post) => {
    // First check if post has embedded analytics
    if (post.analytics && (post.analytics.likes || post.analytics.views || post.analytics.comments || post.analytics.shares)) {
      return {
        likes: post.analytics.likes || 0,
        comments: post.analytics.comments || 0,
        shares: post.analytics.shares || 0,
        views: post.analytics.views || 0,
      };
    }

    // Try to match with analytics from API by platform_post_id first
    const platformPostId = post.publishing?.platform_post_id;
    if (platformPostId) {
      // Try exact match
      const analytics = analyticsMap[platformPostId] || analyticsMap[String(platformPostId)];
      if (analytics) {
        return {
          likes: analytics.metrics?.likes || 0,
          comments: analytics.metrics?.comments || 0,
          shares: analytics.metrics?.shares || 0,
          views: analytics.metrics?.views || 0,
        };
      }
    }

    // Fallback: try matching by post _id (some analytics use post._id as post_id)
    if (post._id) {
      // Try exact match and stringified match
      const analytics = analyticsMap[post._id] || analyticsMap[String(post._id)];
      if (analytics) {
        return {
          likes: analytics.metrics?.likes || 0,
          comments: analytics.metrics?.comments || 0,
          shares: analytics.metrics?.shares || 0,
          views: analytics.metrics?.views || 0,
        };
      }
    }

    return null;
  };

  const getPostContent = (post: Post): string => {
    if (typeof post.content === 'string') return post.content;
    if (post.content?.text) return post.content.text;
    if (post.content?.caption) return post.content.caption;
    return post.title || 'No content';
  };

  const getPostDate = (post: Post): string => {
    return post.publishing?.published_at || post.createdAt || '';
  };

  return (
    <Card className="border border-gray-200/04">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Recent Posts
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={loading || refreshing}
              className="h-8 w-8 p-0"
              title="Refresh engagement metrics"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
            <Link href="/creator/posts?status=published">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-500">
            No published posts yet
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => {
              const PlatformIcon = platformIcons[post.platform?.toLowerCase()] || Facebook;
              const platformColor = platformColors[post.platform?.toLowerCase()] || 'text-gray-600';
              
              return (
                <div key={post._id} className="border p-4 rounded-lg hover:bg-gray-50/50 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-muted">
                          <PlatformIcon className={cn("w-4 h-4", platformColor)} />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium capitalize text-foreground">{post.platform}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(getPostDate(post))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`px-2.5 py-1 text-xs font-sm rounded-full capitalize ${statusColors[post.status] || statusColors.published}`}>
                        {post.status}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-foreground mb-3 line-clamp-2">
                    {getPostContent(post)}
                  </p>
                  
                  {(() => {
                    const metrics = getPostAnalytics(post);
                    return (
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        {metrics ? (
                          <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1" title="Likes">
                              <Heart className={`w-3.5 h-3.5 ${metrics.likes > 0 ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
                              <span className={`font-medium ${metrics.likes > 0 ? 'text-gray-700' : 'text-gray-400'}`}>
                                {metrics.likes.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1" title="Comments">
                              <MessageCircle className={`w-3.5 h-3.5 ${metrics.comments > 0 ? 'text-blue-500' : 'text-gray-400'}`} />
                              <span className={`font-medium ${metrics.comments > 0 ? 'text-gray-700' : 'text-gray-400'}`}>
                                {metrics.comments.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1" title="Shares">
                              <Share2 className={`w-3.5 h-3.5 ${metrics.shares > 0 ? 'text-green-500' : 'text-gray-400'}`} />
                              <span className={`font-medium ${metrics.shares > 0 ? 'text-gray-700' : 'text-gray-400'}`}>
                                {metrics.shares.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1" title="Views">
                              <Eye className={`w-3.5 h-3.5 ${metrics.views > 0 ? 'text-purple-500' : 'text-gray-400'}`} />
                              <span className={`font-medium ${metrics.views > 0 ? 'text-gray-700' : 'text-gray-400'}`}>
                                {metrics.views.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400">No metrics available</div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          {post.publishing?.platform_url ? (
                            <a
                              href={post.publishing.platform_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 transition-colors font-medium"
                              title="View on platform"
                            >
                              <ExternalLink className="w-3 h-3" />
                              View on {post.platform}
                            </a>
                          ) : (
                            <Link href="/creator/posts?status=published">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                title="View post details"
                              >
                                View Details
                              </Button>
                            </Link>
                          )}
                          <Link href="/creator/posts?status=published">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                title="View post details"
                              >
                                View Post
                              </Button>
                            </Link>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentPosts;