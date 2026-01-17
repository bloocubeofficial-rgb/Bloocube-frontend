import { useState, useEffect, useCallback } from 'react';
import { notificationService, type Notification } from '@/lib/notificationService';

interface UseNotificationsOptions {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  type?: string;
  priority?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
  unreadCountError: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const {
    page = 1,
    limit = 20,
    unreadOnly = false,
    type,
    priority,
    autoRefresh = true,
    refreshInterval = 30000 // 30 seconds
  } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [currentPage, setCurrentPage] = useState(page);
  
  // Rate limiting state for unread count
  const [lastUnreadCountFetch, setLastUnreadCountFetch] = useState<number>(0);
  const [unreadCountError, setUnreadCountError] = useState<string | null>(null);
  const [isFetchingUnreadCount, setIsFetchingUnreadCount] = useState(false);

  const fetchNotifications = useCallback(async (pageNum: number = currentPage, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const response = await notificationService.getNotifications({
        page: pageNum,
        limit,
        unreadOnly,
        type,
        priority
      });

      if (response.success) {
        const newNotifications = response.data.notifications;
        
        if (append) {
          setNotifications(prev => [...prev, ...newNotifications]);
        } else {
          setNotifications(newNotifications);
        }
        
        setUnreadCount(response.data.unreadCount);
        setPagination(response.data.pagination);
        setCurrentPage(pageNum);
      } else {
        throw new Error('Failed to fetch notifications');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notifications';
      // Only set error if it's a real error (not a network failure during background refresh)
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        // Network error - might be backend down or CORS issue
        // Don't show error for background refreshes, only log
        if (append || pageNum > 1) {
          console.debug('Network error fetching notifications (background refresh):', err);
        } else {
          setError('Unable to connect to server. Please check your connection.');
        }
      } else {
        setError(errorMessage);
        console.error('Error fetching notifications:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, unreadOnly, type, priority]);

  const fetchUnreadCount = useCallback(async (force: boolean = false) => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastUnreadCountFetch;
    const minInterval = 10000; // 10 seconds minimum between requests
    
    // Rate limiting: don't fetch if we've fetched recently and it's not forced
    if (!force && timeSinceLastFetch < minInterval) {
      console.log('⏳ Rate limiting: Skipping unread count fetch (too soon)');
      return;
    }
    
    // Don't fetch if already fetching
    if (isFetchingUnreadCount) {
      console.log('⏳ Rate limiting: Skipping unread count fetch (already fetching)');
      return;
    }
    
    try {
      setIsFetchingUnreadCount(true);
      setUnreadCountError(null);
      
      const response = await notificationService.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.data.unreadCount);
        setLastUnreadCountFetch(now);
        console.log('✅ Unread count updated:', response.data.unreadCount);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch unread count';
      console.error('❌ Error fetching unread count:', err);
      
      // Handle rate limiting specifically
      if (errorMessage.includes('429') || errorMessage.includes('Too Many Requests')) {
        setUnreadCountError('Rate limited - will retry later');
        console.log('🚫 Rate limited on unread count fetch, backing off');
      } else {
        setUnreadCountError(errorMessage);
      }
    } finally {
      setIsFetchingUnreadCount(false);
    }
  }, [lastUnreadCountFetch, isFetchingUnreadCount]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: true, readAt: new Date().toISOString() }
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          isRead: true,
          readAt: new Date().toISOString()
        }))
      );
      
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      throw err;
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      
      setNotifications(prev => 
        prev.filter(notification => notification._id !== notificationId)
      );
      
      // Update unread count if the deleted notification was unread
      const deletedNotification = notifications.find(n => n._id === notificationId);
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
      throw err;
    }
  }, [notifications]);

  const refreshNotifications = useCallback(async () => {
    await fetchNotifications(1, false);
    // Force fetch unread count on manual refresh
    await fetchUnreadCount(true);
  }, [fetchNotifications, fetchUnreadCount]);

  const loadMore = useCallback(async () => {
    if (currentPage < pagination.pages) {
      await fetchNotifications(currentPage + 1, true);
    }
  }, [currentPage, pagination.pages, fetchNotifications]);

  // Initial load
  useEffect(() => {
    fetchNotifications(1, false);
  }, [fetchNotifications]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/ac687333-012d-42d4-b6b1-5e4b89356f84',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useNotifications.ts:232',message:'Auto-refresh interval triggered',data:{loading,refreshInterval},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      // Only fetch if auto-refresh is enabled and not currently loading
      if (!loading) {
        // Fetch unread count with rate limiting (silent - don't show errors)
        fetchUnreadCount(false).catch(() => {
          // Silently handle errors for background refresh
        });
        
        // Only refresh notifications if not currently loading
        fetchNotifications(1, false).catch(() => {
          // Silently handle errors for background refresh
        });
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchUnreadCount, fetchNotifications, loading]);

  const refreshUnreadCount = useCallback(async () => {
    await fetchUnreadCount(true);
  }, [fetchUnreadCount]);

  const hasMore = currentPage < pagination.pages;

  return {
    notifications,
    loading,
    error,
    unreadCount,
    unreadCountError,
    pagination,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
    refreshUnreadCount,
    hasMore,
    loadMore
  };
}