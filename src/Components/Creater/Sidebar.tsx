'use client';

import {
  Home,
  FileText,
  BarChart3,
  Users,
  Settings,
  User,
  Store,
  LogOut,
  Bell,
} from 'lucide-react';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { authUtils } from '@/lib/auth';

const sidebarItems = [
  { name: 'Overview', icon: Home, href: '/creator' },
  { name: 'Posts', icon: FileText, href: '/creator/posts' },
  { name: 'Analytics', icon: BarChart3, href: '/creator/analytics' },
  { name: 'Marketplace', icon: Store, href: '/creator/marketplace' },
  { name: 'Bids', icon: FileText, href: '/creator/bids' },
  { name: 'Competitors', icon: Users, href: '/creator/competitors' },
  { name: 'Notifications', icon: Bell, href: '/creator/notifications' },
  { name: 'Settings', icon: Settings, href: '/creator/settings' },
];

// Memoized sidebar item component
const SidebarItem = React.memo(({ 
  item, 
  isActive, 
  onItemClick 
}: { 
  item: typeof sidebarItems[0]; 
  isActive: boolean; 
  onItemClick: (href: string) => void;
}) => {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onItemClick(item.href);
  }, [onItemClick, item.href]);

  return (
    <button
      className={`group flex items-center w-full px-3 py-2 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 cursor-pointer transition-all duration-300 ease-in-out rounded-lg mx-1.5 transform hover:scale-[1.01] hover:shadow-md text-left ${
        isActive
          ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 shadow-md border border-blue-200/50 scale-[1.01]'
          : 'hover:shadow'
      }`}
      onClick={handleClick}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-2.5 transition-all duration-300 ease-in-out ${
        isActive 
          ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow scale-105' 
          : 'bg-gray-100 group-hover:bg-gradient-to-r group-hover:from-blue-100 group-hover:to-purple-100 group-hover:scale-105'
      }`}>
        <item.icon className={`w-4 h-4 transition-all duration-300 ${
          isActive ? 'text-white scale-105' : 'text-gray-600 group-hover:text-blue-600 group-hover:scale-105'
        }`} />
      </div>
      <span className="font-semibold text-sm transition-all duration-300 group-hover:translate-x-1 whitespace-nowrap">{item.name}</span>
    </button>
  );
});

SidebarItem.displayName = 'SidebarItem';

// Memoized user info component
const UserInfo = React.memo(({ user }: { user: Record<string, unknown> | null }) => {
  const router = useRouter();
  
  const handleLogout = () => {
    authUtils.clearAuth();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/90 backdrop-blur-sm shadow-xl border border-gray-200/30 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group">
      <div className="relative">
        <div className="w-12 h-12 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
          <User className="w-6 h-6 text-white" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 truncate">
          {(user.name as string) || (user.email as string) || 'Creator Account'}
        </p>
        <p className="text-xs text-gray-500 truncate font-medium">
          {(user.email as string) || 'creator@bloocube.com'}
        </p>
      </div>
      <button 
        onClick={handleLogout} 
        className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 hover:scale-110 group"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </div>
  );
});

UserInfo.displayName = 'UserInfo';

const Sidebar = React.memo(() => {
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Get user information on component mount
    const userData = authUtils.getUser();
    setUser(userData);
  }, []);

  const handleItemClick = useCallback((href: string) => {
    router.push(href);
  }, [router]);

  // Helper function to determine if a sidebar item is active
  const isItemActive = useCallback((item: typeof sidebarItems[0]) => {
    // Normalize pathname by removing trailing slashes and query params
    const normalizedPathname = pathname.replace(/\/$/, '').split('?')[0];
    const normalizedHref = item.href.replace(/\/$/, '');
    
    // Special case for Overview - only active on exact match
    if (normalizedHref === '/creator') {
      return normalizedPathname === '/creator';
    }
    
    // For all other routes, check if pathname starts with the href
    return normalizedPathname.startsWith(normalizedHref);
  }, [pathname]);

  // Memoized sidebar items
  const sidebarItemsList = useMemo(() => 
    sidebarItems.map((item) => (
      <SidebarItem
        key={item.name}
        item={item}
        isActive={isItemActive(item)}
        onItemClick={handleItemClick}
      />
    )), [isItemActive, handleItemClick]);

  return (
    <div className="fixed left-0 top-0 w-56 h-screen bg-white/95 backdrop-blur-md shadow-2xl border-r border-gray-200/50 flex flex-col z-50">
      {/* Enhanced Logo Section */}
      <div className="p-4 border-b border-gray-200/50 bg-gradient-to-r from-blue-50/30 to-purple-50/30">
        <div className="flex items-center justify-center">
          <div className="relative w-24 h-24">
            <Image
              src="/logo.png"
              alt="Bloocube Logo"
              fill
              className="object-contain p-1"
            />
          </div>
        </div>
      </div>
      
      {/* Enhanced Navigation */}
      <nav className="mt-4 flex-1 px-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <div className="space-y-1.5">
          {sidebarItemsList}
        </div>
      </nav>
      
      {/* Enhanced User info and logout section */}
      <div className="p-6 border-t border-gray-200/30 bg-gradient-to-r from-gray-50/30 to-blue-50/20">
        <UserInfo user={user} />
      </div>
    </div>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
