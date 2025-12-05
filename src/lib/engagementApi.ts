// Engagement API utility functions
import { apiRequest } from './apiClient';

export interface EngagementMetrics {
  likes: number;
  comments: number;
  shares: number;
  views: number;
  engagement_rate?: number;
}

export interface PlatformEngagement {
  success: boolean;
  platform: string;
  metrics: EngagementMetrics & { posts?: number };
  posts?: Array<{
    postId: string;
    likes: number;
    comments: number;
    shares: number;
    views: number;
    url?: string;
    timestamp?: string;
    page?: {  // Facebook posts include page information
      id: string;
      name: string;
    };
  }>;
  error?: string;
  comingSoon?: boolean;
  message?: string;
  pages?: Array<{  // Facebook returns all pages
    id: string;
    name: string;
  }>;
  totalPages?: number;  // Facebook returns total page count
}

export interface AllPlatformEngagement {
  success: boolean;
  data: {
    platforms: {
      [platform: string]: PlatformEngagement;
    };
    summary: {
      totalLikes: number;
      totalComments: number;
      totalShares: number;
      totalViews: number;
      totalPosts: number;
      platforms: string[];
    };
  };
}

export interface PublishedPost {
  _id: string;
  title?: string;
  content?: any;
  platform: string;
  post_type: string;
  platform_post_id?: string;
  platform_url?: string;
  published_at?: string;
  metrics: EngagementMetrics;
  createdAt: string;
}

export interface PublishedPostsResponse {
  success: boolean;
  data: {
    posts: PublishedPost[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

/**
 * Fetch engagement metrics for all platforms
 */
export async function fetchAllPlatformEngagement(): Promise<AllPlatformEngagement> {
  return apiRequest<AllPlatformEngagement>('/api/engagement');
}

/**
 * Fetch engagement metrics for a specific platform
 */
export async function fetchPlatformEngagement(platform: string): Promise<PlatformEngagement> {
  try {
    const response = await apiRequest<{ success: boolean; data?: PlatformEngagement; comingSoon?: boolean; message?: string }>(`/api/engagement/${platform}`);
    console.log(`Raw response for ${platform}:`, response);
    
    // Extract the nested data structure - API returns { success: true, data: { success, platform, metrics, posts } }
    if (response && response.data) {
      console.log(`Extracted data for ${platform}:`, response.data);
      return response.data;
    }
    
    // If response has success: false or comingSoon, handle it
    if (response && (response.success === false || response.comingSoon)) {
      return {
        success: false,
        platform,
        metrics: { likes: 0, comments: 0, shares: 0, views: 0 },
        comingSoon: response.comingSoon || false,
        message: response.message || 'Platform not supported',
        error: response.message || 'Platform not supported'
      };
    }
    
    // If no data field, return the response as-is (for error cases)
    console.warn(`Unexpected response structure for ${platform}:`, response);
    return response as PlatformEngagement;
  } catch (error) {
    console.error(`Error fetching platform engagement for ${platform}:`, error);
    // Return error structure
    let errorMessage = 'Failed to fetch engagement data';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return {
      success: false,
      platform,
      metrics: { likes: 0, comments: 0, shares: 0, views: 0 },
      error: errorMessage
    };
  }
}

/**
 * Fetch all published posts with engagement metrics
 */
export async function fetchPublishedPosts(params?: {
  platform?: string;
  page?: number;
  limit?: number;
  includeMetrics?: boolean;
}): Promise<PublishedPostsResponse> {
  const queryParams = new URLSearchParams();
  if (params?.platform) queryParams.append('platform', params.platform);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.includeMetrics !== undefined) {
    queryParams.append('includeMetrics', params.includeMetrics.toString());
  }

  const queryString = queryParams.toString();
  const url = `/api/engagement/posts/all${queryString ? `?${queryString}` : ''}`;
  return apiRequest<PublishedPostsResponse>(url);
}

/**
 * Sync metrics for a specific post
 */
export async function syncPostMetrics(postId: string): Promise<{ success: boolean; data?: any }> {
  return apiRequest<{ success: boolean; data?: any }>(
    `/api/engagement/posts/${postId}/sync`,
    { method: 'POST' }
  );
}

/**
 * Platform support information
 */
export interface PlatformSupport {
  supportsMetrics: boolean;
  supportsViews: boolean;
  supportsLikes: boolean;
  supportsComments: boolean;
  supportsShares: boolean;
  message: string | null;
}

export interface PlatformSupportResponse {
  success: boolean;
  data: {
    [platform: string]: PlatformSupport;
  };
}

/**
 * Fetch platform support information
 */
export async function fetchPlatformSupport(): Promise<PlatformSupportResponse> {
  return apiRequest<PlatformSupportResponse>('/api/engagement/platforms/support');
}

