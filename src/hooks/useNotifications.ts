// src/hooks/useNotifications.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationService, type Notification } from '@/lib/notificationService';

interface UseNotificationsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  initialLimit?: number;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    initialLimit = 10
  } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load notifications
  const loadNotifications = useCallback(async (limit = initialLimit) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await notificationService.getNotifications({
        page: 1,
        limit,
        unreadOnly: false
      });
      
      if (response.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [initialLimit]);

  // Load unread count only
  const loadUnreadCount = useCallback(async () => {
    try {
      const response = await notificationService.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (err) {
      console.error('Failed to load unread count:', err);
    }
  }, []);

  // Mark notification as read
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
      console.error('Failed to mark notification as read:', err);
      setError(err instanceof Error ? err.message : 'Failed to mark as read');
    }
  }, []);

  // Mark all notifications as read
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
      console.error('Failed to mark all notifications as read:', err);
      setError(err instanceof Error ? err.message : 'Failed to mark all as read');
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      
      setNotifications(prev => {
        const notification = prev.find(n => n._id === notificationId);
        const wasUnread = notification && !notification.isRead;
        
        if (wasUnread) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        
        return prev.filter(n => n._id !== notificationId);
      });
    } catch (err) {
      console.error('Failed to delete notification:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete notification');
    }
  }, []);

  // Toggle dropdown
  const toggleDropdown = useCallback(() => {
    setShowDropdown(prev => !prev);
  }, []);

  // Close dropdown
  const closeDropdown = useCallback(() => {
    setShowDropdown(false);
  }, []);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown, closeDropdown]);

  // Load notifications when dropdown opens
  useEffect(() => {
    if (showDropdown && notifications.length === 0) {
      loadNotifications();
    }
  }, [showDropdown, notifications.length, loadNotifications]);

  // Auto-refresh unread count
  useEffect(() => {
    if (autoRefresh) {
      // Load initial unread count
      loadUnreadCount();
      
      // Set up interval for auto-refresh
      intervalRef.current = setInterval(() => {
        loadUnreadCount();
      }, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, loadUnreadCount]);

  // Get priority icon
  const getPriorityIcon = useCallback((priority: string) => {
    switch (priority) {
      case 'urgent':
        return '🔴';
      case 'high':
        return '🟠';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '🔵';
    }
  }, []);

  // Get priority color
  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  }, []);

  // Get type icon
  const getTypeIcon = useCallback((type: string) => {
    switch (type) {
      case 'system':
        return '⚙️';
      case 'campaign_update':
        return '📢';
      case 'bid_status':
        return '💰';
      case 'post_status':
        return '📝';
      case 'alert':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'warning':
        return '⚠️';
      default:
        return '📄';
    }
  }, []);

  return {
    // State
    notifications,
    unreadCount,
    loading,
    error,
    showDropdown,
    
    // Actions
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    toggleDropdown,
    closeDropdown,
    
    // Utilities
    getPriorityIcon,
    getPriorityColor,
    getTypeIcon,
    
    // Refs
    dropdownRef
  };
}
