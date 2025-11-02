import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/lib/apiClient';

export interface Competitor {
  id: string;
  name: string;
  handle: string;
  platform: string;
  followers: number;
  engagement: number;
  avgLikes: number;
  avgComments: number;
  avgShares: number;
  recentPosts: number;
  growthRate: number;
  category: string;
  verified: boolean;
  avatar: string;
  profileUrl?: string;
  lastAnalyzed?: string;
}

interface CompetitorAnalysis {
  id: string;
  competitorUrls: string[];
  analysisType: string;
  createdAt: string;
  status: string;
}

interface UseCompetitorsOptions {
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseCompetitorsReturn {
  competitors: Competitor[];
  analyses: CompetitorAnalysis[];
  loading: boolean;
  error: string | null;
  refreshCompetitors: () => Promise<void>;
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

export function useCompetitors(options: UseCompetitorsOptions = {}): UseCompetitorsReturn {
  const {
    limit = 10,
    autoRefresh = true,
    refreshInterval = 300000 // 5 minutes
  } = options;

  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [analyses, setAnalyses] = useState<CompetitorAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadCompetitorDataFromAnalyses = useCallback(async (analyses: CompetitorAnalysis[]) => {
    try {
      setLoading(true);
      // Limit detail fetches to avoid flooding; take up to latest 5
      const latest = analyses.slice(0, 5);
      const detailResponses = await Promise.all(
        latest.map(a => apiRequest<{ success: boolean; data: Record<string, unknown> }>(`/api/competitor/analysis/${a.id}`))
      );
      const items: Competitor[] = [];
      const seen = new Set<string>();
      
      for (const resp of detailResponses) {
        const d = resp?.data as any;
        const compList = d?.competitor_analysis?.competitors || d?.data?.results?.competitors_data || [];
        
        for (const c of compList) {
          const platform = (c.platform || '').toString();
          const username = (c.username || '').toString();
          const key = `${platform}:${username}`;
          
          if (!username || !platform || seen.has(key)) continue;
          seen.add(key);
          
          const metrics = c.key_metrics || c.profile_metrics || {};
          const followers = metrics.followers || 0;
          const engagement = typeof metrics.engagement_rate === 'number' ? metrics.engagement_rate : parseFloat(metrics.engagement_rate || '0');
          const postsAnalyzed = metrics.posts_analyzed || 0;
          
          items.push({
            id: key,
            name: username,
            handle: `@${username}`,
            platform,
            followers: Number(followers),
            engagement: Number(engagement),
            avgLikes: Number(metrics.average_likes || 0),
            avgComments: Number(metrics.average_comments || 0),
            avgShares: Number(metrics.average_shares || 0),
            recentPosts: Number(postsAnalyzed),
            growthRate: Number(metrics.growth_rate || 0),
            category: c.category || 'General',
            verified: Boolean(metrics.verified || false),
            avatar: c.avatar || '',
            profileUrl: c.profile_url || '',
            lastAnalyzed: c.last_analyzed || new Date().toISOString()
          });
        }
      }
      
      setCompetitors(items);
    } catch (err) {
      console.error('Error loading competitor data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load competitor data');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAnalyses = useCallback(async () => {
    try {
      setError(null);
      const response = await apiRequest<{ 
        success: boolean; 
        data: { 
          analyses: CompetitorAnalysis[];
          pagination?: {
            page: number;
            limit: number;
            total: number;
            pages: number;
          };
        } 
      }>(`/api/competitor/history?limit=${limit}&page=${currentPage}`);
      
      if (response.success) {
        setAnalyses(response.data.analyses);
        await loadCompetitorDataFromAnalyses(response.data.analyses);
        
        // Update hasMore based on pagination
        if (response.data.pagination) {
          setHasMore(currentPage < response.data.pagination.pages);
        }
      } else {
        throw new Error('Failed to fetch analyses');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch competitor analyses';
      setError(errorMessage);
      console.error('Error fetching analyses:', err);
    }
  }, [loadCompetitorDataFromAnalyses, limit, currentPage]);

  const refreshCompetitors = useCallback(async () => {
    setCurrentPage(1);
    // Fetch with page 1 explicitly
    try {
      setError(null);
      const response = await apiRequest<{ 
        success: boolean; 
        data: { 
          analyses: CompetitorAnalysis[];
          pagination?: {
            page: number;
            limit: number;
            total: number;
            pages: number;
          };
        } 
      }>(`/api/competitor/history?limit=${limit}&page=1`);
      
      if (response.success) {
        setAnalyses(response.data.analyses);
        await loadCompetitorDataFromAnalyses(response.data.analyses);
        
        if (response.data.pagination) {
          setHasMore(1 < response.data.pagination.pages);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch competitor analyses';
      setError(errorMessage);
      console.error('Error fetching analyses:', err);
    }
  }, [loadCompetitorDataFromAnalyses, limit]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    
    try {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      
      // Fetch with nextPage directly since state update is async
      setError(null);
      const response = await apiRequest<{ 
        success: boolean; 
        data: { 
          analyses: CompetitorAnalysis[];
          pagination?: {
            page: number;
            limit: number;
            total: number;
            pages: number;
          };
        } 
      }>(`/api/competitor/history?limit=${limit}&page=${nextPage}`);
      
      if (response.success) {
        // Append new analyses to existing ones
        setAnalyses(prev => [...prev, ...response.data.analyses]);
        await loadCompetitorDataFromAnalyses(response.data.analyses);
        
        if (response.data.pagination) {
          setHasMore(nextPage < response.data.pagination.pages);
        }
      }
    } catch (err) {
      console.error('Error loading more competitors:', err);
      setError(err instanceof Error ? err.message : 'Failed to load more competitors');
    }
  }, [hasMore, loading, currentPage, limit, loadCompetitorDataFromAnalyses]);

  // Initial load
  useEffect(() => {
    fetchAnalyses();
  }, [fetchAnalyses]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshCompetitors();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshCompetitors]);

  return {
    competitors,
    analyses,
    loading,
    error,
    refreshCompetitors,
    hasMore,
    loadMore
  };
}
