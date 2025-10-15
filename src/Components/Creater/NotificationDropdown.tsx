// src/Components/Creater/NotificationDropdown.tsx
'use client';

import React from 'react';
import { 
  Bell, 
  Check, 
  Trash2, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  AlertTriangle,
  X
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationDropdownProps {
  className?: string;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ className = '' }) => {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    showDropdown,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    toggleDropdown,
    closeDropdown,
    getPriorityIcon,
    getPriorityColor,
    dropdownRef
  } = useNotifications();

  const getTypeIconComponent = (type: string) => {
    switch (type) {
      case 'system':
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      case 'campaign_update':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'bid_status':
        return <Info className="w-4 h-4 text-purple-600" />;
      case 'post_status':
        return <CheckCircle className="w-4 h-4 text-indigo-600" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={toggleDropdown}
        className="relative p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 hover:scale-105"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={closeDropdown}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
              </div>
            )}

            {error && (
              <div className="p-4 text-center">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-red-600 text-sm">!</span>
                </div>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {!loading && !error && notifications.length === 0 && (
              <div className="p-4 text-center">
                <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No notifications yet</p>
              </div>
            )}

            {!loading && !error && notifications.length > 0 && (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 hover:bg-gray-50 transition-colors duration-200 ${
                      !notification.isRead ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Type Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        {getTypeIconComponent(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 line-clamp-1">
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                          </div>
                          
                          {/* Priority Badge */}
                          <div className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                            {getPriorityIcon(notification.priority)}
                          </div>
                        </div>

                        {/* Time and Actions */}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {notification.timeAgo}
                          </span>
                          
                          <div className="flex items-center space-x-1">
                            {!notification.isRead && (
                              <button
                                onClick={() => markAsRead(notification._id)}
                                className="p-1 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors duration-200"
                                title="Mark as read"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            )}
                            
                            <button
                              onClick={() => deleteNotification(notification._id)}
                              className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
                              title="Delete notification"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        {notification.actions && notification.actions.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {notification.actions.map((action, index) => (
                              <a
                                key={index}
                                href={action.url}
                                className={`text-xs px-2 py-1 rounded-md font-medium transition-colors duration-200 ${
                                  action.style === 'primary' 
                                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                    : action.style === 'success'
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : action.style === 'warning'
                                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                    : action.style === 'danger'
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                                onClick={closeDropdown}
                              >
                                {action.label}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <a
                href="/creator/notifications"
                className="block text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                onClick={closeDropdown}
              >
                View all notifications
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
