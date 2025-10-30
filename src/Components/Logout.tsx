'use client';

import React, { useState } from 'react';
import { LogOut, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cookieAuthUtils } from '@/lib/cookieAuth';
import { apiRequest } from '@/lib/apiClient';
import { Button } from './ui/Button';
interface LogoutProps {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
  showConfirmation?: boolean;
}

const Logout: React.FC<LogoutProps> = ({ 

  className = 'bg-blue-400 text-amber-50 w-20 h-36',
  showIcon = true,

  showConfirmation = true
}) => {
  const router = useRouter();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleLogout = async () => {
    try {
      // Call logout API to clear server-side cookies
      await apiRequest('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      // Clear client-side user data
      cookieAuthUtils.clearAuth();
      
      // Redirect to login page
      router.push('/login');
      
      console.log('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, clear auth and redirect
      cookieAuthUtils.clearAuth();
      router.push('/login');
    }
  };

  const handleLogoutClick = () => {
    if (showConfirmation) {
      setShowConfirmDialog(true);
    } else {
      handleLogout();
    }
  };

  const handleConfirmLogout = () => {
    setShowConfirmDialog(false);
    handleLogout();
  };

  const handleCancelLogout = () => {
    setShowConfirmDialog(false);
  };

  return (
    <>
      <Button
       
        className={className}
        onClick={handleLogoutClick}
      >
        {showIcon && <LogOut className="w-4 h-4 mr-2" />}
        lOGOUT
      </Button>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirm Logout</h3>
                <p className="text-sm text-gray-500">Are you sure you want to logout?</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleCancelLogout}
              >
                Cancel
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleConfirmLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Logout;