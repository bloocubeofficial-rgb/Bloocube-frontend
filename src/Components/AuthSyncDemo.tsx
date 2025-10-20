"use client";
import { useAuthSync } from '@/hooks/useAuthSync';
import { cookieAuthUtils } from '@/lib/cookieAuth';

export function AuthSyncDemo() {
  const { isAuthenticated, user } = useAuthSync();

  const handleLogin = () => {
    // Simulate login by setting user data cookie
    const mockUser = { id: '1', email: 'test@example.com', role: 'brand' } as any;
    cookieAuthUtils.updateUserData(mockUser);
    cookieAuthUtils.triggerAuthSync();
  };

  const handleLogout = () => {
    cookieAuthUtils.clearAuth();
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Auth Sync Demo</h3>
      <div className="space-y-2">
        <p><strong>Status:</strong> {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p>
        <p><strong>User:</strong> {user ? JSON.stringify(user) : 'None'}</p>
        <div className="flex gap-2">
          <button 
            onClick={handleLogin}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Login
          </button>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
        <p className="text-sm text-gray-600">
          Open this page in multiple tabs and test the login/logout buttons. 
          All tabs should sync automatically!
        </p>
      </div>
    </div>
  );
}
