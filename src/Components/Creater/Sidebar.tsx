'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  FileText,
  BarChart3,
  Users,
  Settings,
  Store,
  LogOut,
  Bell,
  User,
} from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';
import { cookieAuthUtils } from '@/lib/cookieAuth';

const sidebarItems = [
  { name: 'Overview', icon: Home, href: '/creator', color: 'blue' },
  { name: 'Posts', icon: FileText, href: '/creator/posts', color: 'green' },
  { name: 'Analytics', icon: BarChart3, href: '/creator/analytics', color: 'indigo' },
  { name: 'Marketplace', icon: Store, href: '/creator/marketplace', color: 'purple' },
  { name: 'Bids', icon: FileText, href: '/creator/bids', color: 'orange' },
  { name: 'Competitors', icon: Users, href: '/creator/competitors', color: 'red' },
  { name: 'Notifications', icon: Bell, href: '/creator/notifications', color: 'red' },
  { name: 'Settings', icon: Settings, href: '/creator/settings', color: 'gray' },
];

// This interface is required
interface SidebarProps {
  sidebarOpen: boolean;
}

// Accept the 'sidebarOpen' prop
const Sidebar = React.memo(({ sidebarOpen }: SidebarProps) => { 
  const [user, setUser] = useState<{ name?: string, email?: string, avatar_url?: string } | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const userData = cookieAuthUtils.getUser();
    setUser(userData as { name?: string, email?: string, avatar_url?: string } | null);
  }, []);

  const isItemActive = useCallback((item: typeof sidebarItems[0]) => {
    const normalizedPathname = pathname.replace(/\/$/, '').split('?')[0];
    const normalizedHref = item.href.replace(/\/$/, '');
    
    if (normalizedHref === '/creator') {
      return normalizedPathname === '/creator';
    }
    
    return normalizedPathname.startsWith(normalizedHref);
  }, [pathname]);

  const onLogout = useCallback(() => {
    cookieAuthUtils.clearAuth();
    router.push('/login');
  }, [router]);

  const getNavItemClasses = (item: typeof sidebarItems[0], isActive: boolean) => {
    const baseClasses = "group relative flex items-center px-4 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-500 ease-out transform hover:scale-[1.02] hover:shadow-lg";
    const activeClasses = `bg-gradient-to-r from-${item.color}-500 via-${item.color}-600 to-${item.color}-700 text-white shadow-xl shadow-${item.color}-200/50 before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300`;
    const inactiveClasses = "text-gray-700 hover:bg-white/80 hover:text-gray-900 hover:shadow-md backdrop-blur-sm border border-transparent hover:border-gray-200/50";
    
    return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  };

  const getIconClasses = (item: typeof sidebarItems[0], isActive: boolean) => {
    const baseClasses = "w-5 h-5 transition-all duration-500 ease-out";
    const activeClasses = "text-white drop-shadow-sm";
    const inactiveClasses = `text-gray-500 group-hover:text-${item.color}-600 group-hover:scale-110`;
    
    return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  };

  return (
    // This className controls the mobile slide-in and fixed width
    <aside 
      className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed left-0 top-0 z-50 w-80 h-screen bg-white/95 backdrop-blur-2xl shadow-2xl border-r border-gray-200/30 flex flex-col transition-all duration-700 ease-out`}
    >
      {/* Logo */}
      <div className="p-8 border-b border-gray-200/30 bg-gradient-to-br via-[#654387] from-[#091536] to-[#0B0819] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
        <div className="relative z-10 flex items-center justify-center">
          <div className="relative w-24 h-24">
            <Image
              src="/logo.png"
              alt="Bloocube Logo"
              fill
              className="object-contain p-1 w-24 h-24"
              
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent"></div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-10 translate-x-10"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-full translate-y-8 -translate-x-8"></div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-8 px-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-100">
        <div className="space-y-3">
          {sidebarItems.map(item => {
            const isActive = isItemActive(item);
            return (
              <Link 
                key={item.name} 
                href={item.href} 
                className={getNavItemClasses(item, isActive)}
              >
                <div className="relative">
                  <item.icon className={getIconClasses(item, isActive)} />
                  {isActive && (
                    <div className="absolute -inset-1 bg-white/20 rounded-lg blur-sm"></div>
                  )}
                </div>
                <span className="ml-4 font-medium">{item.name}</span>
                {isActive && (
                  <div className="ml-auto flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse delay-75"></div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-6 border-t border-gray-200/30 bg-gradient-to-r from-gray-50/30 to-blue-50/20">
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/90 backdrop-blur-sm shadow-xl border border-gray-200/30 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group">
          <div className="relative">
            {user === null ? (
              <div className="w-12 h-12 bg-gray-200 rounded-2xl flex items-center justify-center animate-pulse">
                <User className="w-6 h-6 text-gray-400" />
              </div>
            ) : user?.avatar_url ? (
              <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Image
                  src={user.avatar_url}
                  alt={user.name || 'User Avatar'}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <User className="w-6 h-6 text-white" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
          </div>
          <div className="flex-1 min-w-0">
            {user === null ? (
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {user?.name || 'Creator Account'}
                </p>
                <p className="text-xs text-gray-500 truncate font-medium">
                  {user?.email || 'creator@bloocube.com'}
                </p>
              </div>
            )}
          </div>
          <button onClick={onLogout} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 hover:scale-110 group">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;