"use client";
import { useState, useEffect } from 'react';
import { useCampaigns } from '@/hooks/useCampaigns';
import { campaignService } from '@/lib/campaignService';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useCompetitors } from '@/hooks/useCompetitors';
import { 
  PlusIcon, 
  EyeIcon, 
  UsersIcon, 
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  BellIcon,
  ArrowPathIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  UserGroupIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { TrendingUp } from 'lucide-react';
import Link from 'next/link';
import BrandLayout from './layout'
import { Plus } from 'lucide-react';
export default function BrandDashboard() {
  const { user, isLoading } = useAuth();
  const { data: campaigns, loading: campaignsLoading } = useCampaigns({ limit: 5 });
  const [stats, setStats] = useState({
    totalBids: 0,
    pendingBids: 0,
    acceptedBids: 0,
    totalSpent: 0
  });
  const [loading, setLoading] = useState(true);

  // Notifications
  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    error: notificationsError,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications
  } = useNotifications({
    limit: 5,
    autoRefresh: true,
    refreshInterval: 30000
  });

  // Competitors
  const {
    competitors,
    loading: competitorsLoading,
    error: competitorsError,
    refreshCompetitors
  } = useCompetitors({
    limit: 5,
    autoRefresh: true,
    refreshInterval: 300000 // 5 minutes
  });

  const brandId = user?.id;

  useEffect(() => {
    const fetchStats = async () => {
      if (!brandId) return;
      
      try {
        setLoading(true);
        // Reduce initial load to improve responsiveness
        const res = await campaignService.listByBrand(brandId as string, { limit: 20 });
        const campaigns = res.data.campaigns || [];
        
        if (campaigns.length === 0) {
          setLoading(false);
          return;
        }

        // Concurrency-limited aggregation to avoid blocking the main thread
        const concurrency = 4;
        const queue = [...campaigns];
        const totals = { totalBids: 0, pendingBids: 0, acceptedBids: 0, totalSpent: 0 };
        async function worker() {
          while (queue.length) {
            const c = queue.shift();
            if (!c) break;
            try {
              const r = await campaignService.listBids(c._id as string);
              const bids = r.data?.bids || [];
              totals.totalBids += bids.length;
              totals.pendingBids += bids.filter(b => b.status === 'pending').length;
              totals.acceptedBids += bids.filter(b => b.status === 'accepted').length;
              totals.totalSpent += bids.filter(b => b.status === 'accepted').reduce((sum, b) => sum + b.bid_amount, 0);
            } catch {}
          }
        }
        await Promise.all(Array.from({ length: Math.min(concurrency, campaigns.length) }, () => worker()));

        setStats(totals);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [brandId]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'brand') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <h1 className="text-lg font-semibold text-gray-900 mb-2">Brand access required</h1>
          <p className="text-sm text-gray-600 mb-4">Please sign in with a brand account to view brand dashboards.</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'draft':
        return <ClockIcon className="w-4 h-4" />;
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  // Notification helper functions
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'bid_accepted':
      case 'payment_received':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'campaign_deadline':
      case 'system_alert':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
      case 'bid_rejected':
        return <XMarkIcon className="w-5 h-5 text-red-600" />;
      case 'bid_received':
      case 'campaign_created':
        return <InformationCircleIcon className="w-5 h-5 text-blue-600" />;
      case 'analytics_update':
        return <CheckCircleIcon className="w-5 h-5 text-purple-600" />;
      case 'ai_suggestion':
        return <CheckCircleIcon className="w-5 h-5 text-indigo-600" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationBgColor = (type: string, priority: string) => {
    const priorityColors = {
      urgent: 'bg-red-50 border-red-300',
      high: 'bg-orange-50 border-orange-200',
      medium: 'bg-blue-50 border-blue-200',
      low: 'bg-gray-50 border-gray-200'
    };

    const typeColors = {
      bid_accepted: 'bg-green-50 border-green-200',
      payment_received: 'bg-green-50 border-green-200',
      campaign_deadline: 'bg-yellow-50 border-yellow-200',
      system_alert: 'bg-red-50 border-red-200',
      bid_rejected: 'bg-red-50 border-red-200',
      bid_received: 'bg-blue-50 border-blue-200',
      campaign_created: 'bg-blue-50 border-blue-200',
      analytics_update: 'bg-purple-50 border-purple-200',
      ai_suggestion: 'bg-indigo-50 border-indigo-200'
    };

    return typeColors[type as keyof typeof typeColors] || priorityColors[priority as keyof typeof priorityColors] || 'bg-gray-50 border-gray-200';
  };

  const formatTimeAgo = (createdAt: string) => {
    const now = new Date();
    const notificationDate = new Date(createdAt);
    const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return notificationDate.toLocaleDateString();
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleRefreshNotifications = async () => {
    try {
      await refreshNotifications();
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  };

  const handleRefreshCompetitors = async () => {
    try {
      await refreshCompetitors();
    } catch (error) {
      console.error('Error refreshing competitors:', error);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return '📷';
      case 'youtube':
        return '🎥';
      case 'twitter':
        return '🐦';
      case 'linkedin':
        return '💼';
      case 'facebook':
        return '👥';
      default:
        return '📱';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  

  return (
   
    <div>
      
  <div className='mb-6 mt-4 lg:mt-1 md:mt-1 flex justify-start lg:justify-end '>
     <Link href="/creator/posts" >
  <button className="   bg-gradient-to-r from-blue-600 to-purple-600 text-sm text-white px-4 py-2.5 rounded-sm  flex items-center space-x-1 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md">
    <Plus className="w-4 h-4" />
    <span>Create New Post</span>
  </button>
</Link>
      </div> 
      {/* Stats Grid */}
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

  <div className="bg-white rounded-sm p-6 hover:shadow-sm border border-gray-200/04">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">Total Campaigns</p>
        <p className="text-2xl font-bold text-gray-900">{campaigns?.length || 0}</p>
      </div>
      <div className="p-2 bg-blue-100 rounded-sm ">
        <ChartBarIcon className="w-6 h-6 text-blue-600" />
      </div>
    </div>
  </div>
<div className="bg-white rounded-sm p-6 hover:shadow-sm border border-gray-200/04">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">Total Bids</p>
        <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.totalBids}</p>
      </div>
      <div className="p-2 bg-green-100 rounded-sm">
        <UsersIcon className="w-6 h-6 text-green-600" />
      </div>
    </div>
  </div>

<div className="bg-white rounded-sm p-6 hover:shadow-sm border border-gray-200/04">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">Pending Bids</p>
        <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.pendingBids}</p>
      </div>
      <div className="p-2 bg-yellow-100 rounded-sm">
        <ClockIcon className="w-6 h-6 text-yellow-600" />
      </div>
    </div>
  </div>

<div className="bg-white rounded-sm p-6 hover:shadow-sm border border-gray-200/04">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">Total Spent</p>
        <p className="text-2xl font-bold text-gray-900">₹{loading ? '...' : stats.totalSpent.toLocaleString()}</p>
      </div>
      <div className="p-2 bg-purple-100 rounded-sm">
        <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
      </div>
    </div>
  </div>

</div>


      {/* Notifications Section */}
     <div className="bg-white rounded-sm p-2  hover:shadow-sm border border-gray-200/04 mt-4">
        <div className="p-3 border-b border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-200  rounded-sm">
                <BellIcon className="w-6 h-6 text-purple-800" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Recent Notifications</h2>
                <p className="text-sm text-gray-500">
                  {unreadCount > 0 
                    ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                    : 'All caught up!'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto sm:justify-end">
              <button
                onClick={handleRefreshNotifications}
                disabled={notificationsLoading}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh notifications"
              >
                <ArrowPathIcon className={`w-4 h-4 ${notificationsLoading ? 'animate-spin' : ''}`} />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={notificationsLoading}
                  className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  Mark all read
                </button>
              )}
              <Link 
                href="/brand/notifications"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View all
              </Link>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {notificationsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : notificationsError ? (
            <div className="text-center py-8">
              <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading notifications</h3>
              <p className="text-gray-500 mb-4">{notificationsError}</p>
              <button
                onClick={handleRefreshNotifications}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : notifications && notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.slice(0, 5).map(notification => (
                <div
                  key={notification._id}
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    notification.isRead 
                      ? 'bg-white border-gray-200' 
                      : `${getNotificationBgColor(notification.type, notification.priority)} border-l-4`
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`font-medium text-sm ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                            {notification.title}
                          </h3>
                          <p className={`text-xs mt-1 ${notification.isRead ? 'text-gray-500' : 'text-gray-600'}`}>
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <ClockIcon className="w-3 h-3" />
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                            {!notification.isRead && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                New
                              </span>
                            )}
                            {notification.priority === 'urgent' && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Urgent
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notification._id)}
                              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                              title="Mark as read"
                            >
                              <CheckCircleIcon className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleDeleteNotification(notification._id)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete notification"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                <BellIcon className="w-12 h-12" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">No notifications yet</h3>
              <p className="text-sm text-gray-500">You'll see notifications here when they arrive</p>
            </div>
          )}
        </div>
      </div>

      {/* Competitors Section */}
     <div className="bg-white rounded-sm p-2 hover:shadow-sm border border-gray-200/04 mt-4">
        <div className="p-3 border-b border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100  rounded-sm">
                <UserGroupIcon className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Competitor Insights</h2>
                <p className="text-sm text-gray-500">
                  Track your competitors' performance and engagement
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto sm:justify-end">
              <button
                onClick={handleRefreshCompetitors}
                disabled={competitorsLoading}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh competitors data"
              >
                <ArrowPathIcon className={`w-4 h-4 ${competitorsLoading ? 'animate-spin' : ''}`} />
              </button>
              <Link 
                href="/creator/competitors"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View all
              </Link>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {competitorsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : competitorsError ? (
            <div className="text-center py-8">
              <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading competitors</h3>
              <p className="text-gray-500 mb-4">{competitorsError}</p>
              <button
                onClick={handleRefreshCompetitors}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : competitors && competitors.length > 0 ? (
            <div className="space-y-4">
              {competitors.slice(0, 5).map(competitor => (
                <div
                  key={competitor.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {competitor.avatar ? (
                            <img 
                              src={competitor.avatar} 
                              alt={competitor.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            competitor.name.charAt(0).toUpperCase()
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900 truncate">{competitor.name}</h3>
                          <span className="text-sm text-gray-500">{competitor.handle}</span>
                          {competitor.verified && (
                            <span className="text-blue-500" title="Verified">✓</span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                          <span className="flex items-center gap-1">
                            <span className="text-lg">{getPlatformIcon(competitor.platform)}</span>
                            {competitor.platform}
                          </span>
                          <span className="flex items-center gap-1">
                            <UsersIcon className="w-4 h-4" />
                            {formatNumber(competitor.followers)} followers
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            {competitor.engagement.toFixed(1)}% engagement
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-6 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <HeartIcon className="w-3 h-3" />
                            {formatNumber(competitor.avgLikes)} avg likes
                          </span>
                          <span className="flex items-center gap-1">
                            <ChatBubbleLeftIcon className="w-3 h-3" />
                            {formatNumber(competitor.avgComments)} avg comments
                          </span>
                          <span className="flex items-center gap-1">
                            <ShareIcon className="w-3 h-3" />
                            {formatNumber(competitor.avgShares)} avg shares
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {competitor.profileUrl && (
                        <a
                          href={competitor.profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                          title="View profile"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                <UserGroupIcon className="w-12 h-12" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">No competitors analyzed yet</h3>
              <p className="text-sm text-gray-500 mb-4">Start analyzing competitors to gain insights into your market.</p>
              <Link 
                href="/creator/competitors"
                className="inline-flex items-center gap-2 px-4 py-2  bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-sm hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                Analyze Competitors
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Campaigns */}
      <div className="bg-white rounded-sm  p-2 hover:shadow-sm border border-gray-200/04 mt-4 ">
        <div className=" border-b  border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">Recent Campaigns</h2>
            <Link 
              href="/brand/campaigns"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View all
            </Link>
          </div>
        </div>
        
       <div className="p-2">

  {campaignsLoading ? (
    <div className="flex items-center justify-center py-4">
      <div className="animate-spin rounded-sm h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  ) : campaigns && campaigns.length > 0 ? (
    <div className="space-y-4">

      {campaigns.slice(0, 5).map(campaign => (
        <div 
          key={campaign._id} 
          className="
            flex flex-col md:flex-row md:items-center md:justify-between 
            gap-3 p-2
            bg-white border border-gray-200/04 rounded-sm hover:shadow-sm mt-6
          "
        >
          {/* Left Side */}
          <div className="flex-1 text-left">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
              {campaign.title}
            </h3>

            <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">
              {campaign.description}
            </p>

            <div 
              className="
                flex flex-col sm:flex-row sm:items-center sm:gap-6 
                gap-2 mt-2 text-gray-600 text-xs sm:text-sm
              "
            >
              <span>Budget: ₹{campaign.budget.toLocaleString()}</span>
              <span>Deadline: {new Date(campaign.deadline).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2 sm:gap-3 self-start md:self-center">
            <span 
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium ${getStatusColor(campaign.status)}`}
            >
              {getStatusIcon(campaign.status)}
              {campaign.status}
            </span>

            <Link 
              href={`/brand/campaigns`}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              <EyeIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ))}

    </div>
  ) : (
    <div className="text-center py-8">
      <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
        <ChartBarIcon className="w-12 h-12" />
      </div>
      <h3 className="text-sm font-medium text-gray-900 mb-2">No campaigns yet</h3>
      <p className="text-sm text-gray-500 mb-4">Get started by creating your first campaign.</p>
      <Link 
        href="/brand/campaigns"
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        <PlusIcon className="w-4 h-4" />
        Create Campaign
      </Link>
    </div>
  )}

</div>

      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        <Link 
          href="/brand/campaigns"
          className="bg-white rounded-sm p-6  border border-gray-200/04 rounded-sm hover:shadow-sm transition-shadow group"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-100 rounded-lsm group-hover:bg-blue-200 transition-colors">
              <PlusIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Create Campaign</h3>
              <p className="text-sm text-gray-500">Launch a new campaign</p>
            </div>
          </div>
        </Link>

        <Link 
          href="/brand/marketplace"
          className="bg-white rounded-sm p-6 hover:shadow-sm border border-gray-200/04  transition-shadow group"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-green-100 rounded-sm group-hover:bg-green-200 transition-colors">
              <UsersIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Browse Creators</h3>
              <p className="text-sm text-gray-500">Discover talented creators</p>
            </div>
          </div>
        </Link>

        <Link 
          href="/brand/bids"
          className="bg-white rounded-sm p-6  border border-gray-200/04 hover:shadow-sm transition-shadow group"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-purple-100 rounded-sm group-hover:bg-purple-200 transition-colors">
              <CheckCircleIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Review Bids</h3>
              <p className="text-sm text-gray-500">Manage incoming proposals</p>
            </div>
          </div>
        </Link>
      </div>
</div>
   
  );
}


