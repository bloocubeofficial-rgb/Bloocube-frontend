"use client";

import { useEffect, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authUtils } from "@/lib/auth";

// Helper function to validate JWT token format
const isValidJWTFormat = (token: string): boolean => {
  if (!token || typeof token !== 'string') return false;
  
  // JWT should have 3 parts separated by dots
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  
  try {
    // Try to decode the header and payload to check if it's valid JSON
    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));
    
    // Check if it has required fields
    return !!(header && payload && payload.id && payload.exp);
  } catch {
    return false;
  }
};

function LinkedInCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Processing LinkedIn connection...");

  useEffect(() => {
    const processCallback = async () => {
       // Check for direct success with session token (from backend redirect)
       const success = searchParams.get("linkedin");
       const token = searchParams.get("token");
       const message = searchParams.get("message");
       const error = searchParams.get("error");
       const error_description = searchParams.get("error_description");

      // Handle direct success with session token
      if (success === "success" && token) {
        setStatus("LinkedIn connected successfully! Logging you in...");
        
        try {
          // Validate token format before using it
          if (!isValidJWTFormat(token)) {
            console.error('Invalid token format received');
            setStatus("Error: Invalid session token");
            setTimeout(() => {
              router.replace("/creator/settings?linkedin=error&message=Invalid+session+token");
            }, 2000);
            return;
          }
          
          // Store the session token and authenticate user
          authUtils.setToken(token);
          
          // Fetch user profile to complete authentication
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            if (userData.success && userData.data) {
              // Store user data
              authUtils.setAuth(token, userData.data.user);
               setStatus("Successfully logged in! Redirecting...");
               setTimeout(() => {
                 const successMessage = message || "LinkedIn+connected+and+logged+in+successfully";
                 router.replace(`/creator/settings?linkedin=success&message=${successMessage}`);
               }, 1500);
              return;
            }
          }
          
           // If user fetch fails, still proceed with token
           setStatus("LinkedIn connected! Redirecting...");
           setTimeout(() => {
             const successMessage = message || "LinkedIn+connected+successfully";
             router.replace(`/creator/settings?linkedin=success&message=${successMessage}`);
           }, 1500);
          
         } catch (err) {
           console.error('Error during auto-login:', err);
           setStatus("LinkedIn connected! Redirecting...");
           setTimeout(() => {
             const successMessage = message || "LinkedIn+connected+successfully";
             router.replace(`/creator/settings?linkedin=success&message=${successMessage}`);
           }, 1500);
         }
        return;
      }

      // Handle errors from backend redirect
      if (error) {
        setStatus(`Error: ${error_description || error}`);
        setTimeout(() => {
          router.replace(`/creator/settings?linkedin=error&message=${encodeURIComponent(error_description || error)}`);
        }, 2000);
        return;
      }

      // Handle OAuth callback flow (legacy - when frontend processes the callback)
      const code = searchParams.get("code");
      const state = searchParams.get("state");

      if (!code || !state) {
        setStatus("Error: Missing authorization code or state");
        setTimeout(() => {
          router.replace("/creator/settings?linkedin=error&message=Missing+code+or+state");
        }, 2000);
        return;
      }

      // Verify state parameter
      const storedState = typeof window !== "undefined" ? localStorage.getItem("linkedin_state") : null;
      if (!storedState || storedState !== state) {
        setStatus("Error: Invalid state parameter");
        setTimeout(() => {
          router.replace("/creator/settings?linkedin=error&message=Invalid+state");
        }, 2000);
        return;
      }

      try {
        setStatus("Exchanging authorization code for access token...");
        
        // Call the callback API endpoint
        const redirectUri = `${window.location.origin}/auth/linkedin/callback`;
        const response = await fetch(`/api/linkedin/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}&redirectUri=${encodeURIComponent(redirectUri)}`);
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            // Store LinkedIn data in localStorage
            localStorage.setItem('linkedin_data', JSON.stringify(result.data));
            localStorage.removeItem('linkedin_state'); // Clean up state
            setStatus("LinkedIn connected successfully! Redirecting...");
            setTimeout(() => {
              router.replace("/creator/settings?linkedin=success&message=LinkedIn+connected+successfully");
            }, 1500);
          } else {
            setStatus(`Error: ${result.error || 'Failed to connect LinkedIn'}`);
            setTimeout(() => {
              router.replace(`/creator/settings?linkedin=error&message=${encodeURIComponent(result.error || 'Failed to connect LinkedIn')}`);
            }, 2000);
          }
        } else {
          const errorData = await response.json();
          setStatus(`Error: ${errorData.error || 'Failed to connect LinkedIn'}`);
          setTimeout(() => {
            router.replace(`/creator/settings?linkedin=error&message=${encodeURIComponent(errorData.error || 'Failed to connect LinkedIn')}`);
          }, 2000);
        }
      } catch (err) {
        console.error('LinkedIn callback error:', err);
        setStatus("Error: Failed to process LinkedIn connection");
        setTimeout(() => {
          router.replace("/creator/settings?linkedin=error&message=Failed+to+process+LinkedIn+connection");
        }, 2000);
      }
    };

    processCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-blue-600 font-bold text-2xl">in</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">LinkedIn Connection</h2>
        <p className="text-gray-600">{status}</p>
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}

export default function LinkedInCallbackPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <LinkedInCallbackContent />
    </Suspense>
  );
}


