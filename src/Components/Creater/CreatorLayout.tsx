"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  User,
  Settings,
  FileText,
  ChevronDown,
  BarChart3,
  LogOut,
} from "lucide-react";
import Sidebar from "./Sidebar"; // Make sure this path is correct
import NotificationDropdown from "./NotificationDropdown";
import { useRouter } from "next/navigation";
import { cookieAuthUtils } from "@/lib/cookieAuth";
import { useAuth } from "@/hooks/useAuth";
import HeaderRow from "@/Components/layout/HeaderRow";

interface CreatorLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
}
const UserInfo = React.memo(
  ({ user }: { user: Record<string, unknown> | null }) => {
    const router = useRouter();

    const handleLogout = () => {
      cookieAuthUtils.clearAuth();
      router.push("/login");
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
            {(user.name as string) ||
              (user.email as string) ||
              "Creator Account"}
          </p>
          <p className="text-xs text-gray-500 truncate font-medium">
            {(user.email as string) || "creator@bloocube.com"}
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
  }
);

UserInfo.displayName = "UserInfo";

const CreatorLayout: React.FC<CreatorLayoutProps> = ({
  children,
  title = "Creator Dashboard",
  subtitle = "Welcome back! Here's your content overview",
  headerActions,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const router = useRouter();

  const displayName =
    ((user as unknown as Record<string, unknown> | null)?.name as string) ||
    ((user as unknown as Record<string, unknown> | null)?.email as string) ||
    "Creator Account";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    };

    if (userDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userDropdownOpen]);

  const handleLogout = () => {
    try {
      cookieAuthUtils.clearAuth();
    } finally {
      setUserDropdownOpen(false);
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br via-[#654387] from-[#091536] to-[#0B0819]">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <button
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out lg:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* FIX 1: Render the Sidebar and pass the sidebarOpen prop to it.
        This component will now control its own mobile/desktop display.
      */}
      <Sidebar sidebarOpen={sidebarOpen} />

      {/* FIX 2: The margin-left MUST match the sidebar's width.
        Changed from lg:ml-56 to lg:ml-80
      */}
      <div className="lg:ml-80">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-200/50 px-3 py-2 flex items-center justify-between sticky top-0 z-[100]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 hover:scale-105 touch-manipulation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-base font-semibold text-gray-900 truncate">
            {title}
          </h1>
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
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[10000]">
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
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Desktop Header */}
        <div className="hidden lg:block bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 overflow-visible relative z-[9999]">
          <div className="px-5 py-3">
            <HeaderRow
              left={(
                <div className="flex items-center space-x-4">
                  <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent ">
                      {title}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
                  </div>
                </div>
              )}
              right={(
                <div className="flex items-center space-x-4 ">
                  <NotificationDropdown />
                  <div className="relative" ref={userDropdownRef}>
                    <button
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="flex items-center space-x-2 p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 hover:scale-105"
                    >
                      <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="hidden md:block text-left">
                        <p className="text-sm font-medium text-gray-900 leading-tight truncate max-w-[140px]">
                          {displayName}
                        </p>
                        <p className="text-xs text-gray-500 leading-tight truncate max-w-[140px]">
                          {user ? "Creator" : "Profile"}
                        </p>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          userDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {userDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200/70 z-[10000] overflow-visible">
                        <div className="p-4 bg-gradient-to-br from-white via-blue-50/50 to-indigo-50/40 border-b border-gray-200/60">
                          <UserInfo user={user || null} />
                        </div>
                        <div className="py-1">
                          <a
                            href="/creator/settings"
                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                            onClick={() => setUserDropdownOpen(false)}
                          >
                            <Settings className="w-4 h-4 mr-3" />
                            Settings
                          </a>
                          <a
                            href="/creator/bids"
                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                            onClick={() => setUserDropdownOpen(false)}
                          >
                            <FileText className="w-4 h-4 mr-3" />
                            My Bids
                          </a>
                          <a
                            href="/creator/analytics"
                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                            onClick={() => setUserDropdownOpen(false)}
                          >
                            <BarChart3 className="w-4 h-4 mr-3" />
                            Analytics
                          </a>
                          <hr className="my-1 border-gray-200/70" />
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full flex items-center px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                          >
                            <LogOut className="w-4 h-4 mr-3" />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  {headerActions && (
                    <div className="flex items-center space-x-2">
                      {headerActions}
                    </div>
                  )}
                </div>
              )}
            />
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 lg:p-5 relative">
          <div className="max-w-7xl mx-auto ">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default CreatorLayout;