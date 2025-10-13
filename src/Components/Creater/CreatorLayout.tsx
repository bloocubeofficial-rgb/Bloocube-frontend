'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, User, Settings, FileText, ChevronDown, BarChart3, LogOut } from 'lucide-react';
import Sidebar from './Sidebar';
import NotificationDropdown from './NotificationDropdown';

interface CreatorLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
}

const CreatorLayout: React.FC<CreatorLayoutProps> = ({ 
  children, 
  title = "Creator Dashboard", 
  subtitle = "Welcome back! Here's your content overview",
  headerActions 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };

    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userDropdownOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out" 
            onClick={() => setSidebarOpen(false)}
            onKeyDown={(e) => e.key === 'Escape' && setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
          <div className="relative z-50 transform transition-transform duration-300 ease-in-out">
            <Sidebar />
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-white shadow-lg hover:bg-gray-50 transition-all duration-200 hover:scale-105"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="lg:ml-56">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-200/50 px-3 py-2 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 hover:scale-105"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-base font-semibold text-gray-900 truncate">{title}</h1>
          <div className="flex items-center space-x-2">
            <NotificationDropdown />
            <div className="relative" ref={userDropdownRef}>
              <button 
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
              >
                <User className="w-3.5 h-3.5" />
              </button>
              
              {/* Mobile Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <a
                    href="/creator/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </a>
                  <a
                    href="/creator/bids"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <FileText className="w-4 h-4 mr-3" />
                    My Bids
                  </a>
                  <a
                    href="/creator/analytics"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <BarChart3 className="w-4 h-4 mr-3" />
                    Analytics
                  </a>
                  <hr className="my-1" />
                  <a
                    href="/logout"
                    className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Desktop Header */}
        <div className="hidden lg:block bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50">
          <div className="px-5 py-3">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      {title}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
                  </div>
                </div>
              </div>
              
              {/* Header Actions */}
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <NotificationDropdown />
                
                {/* User Profile Dropdown */}
                <div className="relative" ref={userDropdownRef}>
                  <button 
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2 p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 hover:scale-105"
                  >
                    <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="hidden md:block">
                      <p className="text-sm font-medium text-gray-900 leading-tight">John Doe</p>
                      <p className="text-xs text-gray-500 leading-tight">Creator</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <a
                        href="/creator/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Settings
                      </a>
                      <a
                        href="/creator/bids"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <FileText className="w-4 h-4 mr-3" />
                        My Bids
                      </a>
                      <a
                        href="/creator/analytics"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <BarChart3 className="w-4 h-4 mr-3" />
                        Analytics
                      </a>
                      <hr className="my-1" />
                      <a
                        href="/logout"
                        className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </a>
                    </div>
                  )}
                </div>
                
                {/* Custom Header Actions */}
                {headerActions && (
                  <div className="flex items-center space-x-2">
                    {headerActions}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 lg:p-5">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorLayout;
