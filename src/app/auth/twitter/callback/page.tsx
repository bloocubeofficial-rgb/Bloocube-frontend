"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { config, getApiBase } from "@/lib/config";
import { cookieAuthUtils } from "@/lib/cookieAuth";

function TwitterCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Twitter OAuth 1.0a uses oauth_token and oauth_verifier, not code and state
    const oauth_token = searchParams.get("oauth_token");
    const oauth_verifier = searchParams.get("oauth_verifier");
    const denied = searchParams.get("denied");
    
    // Handle user denial
    if (denied) {
      router.replace("/creator/settings?twitter=error&message=User+denied+access");
      return;
    }

    // Check for OAuth 1.0a parameters
    if (!oauth_token || !oauth_verifier) {
      // Fallback to OAuth 2.0 parameters for backward compatibility
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      
      if (!code || !state) {
        router.replace("/creator/settings?twitter=error&message=Missing+OAuth+parameters");
        return;
      }

      const storedState = typeof window !== "undefined" ? sessionStorage.getItem("twitter_state") : null;
      if (!storedState || storedState !== state) {
        router.replace("/creator/settings?twitter=error&message=Invalid+state");
        return;
      }

      const redirectUri = config.twitter.callbackUrl || `${window.location.origin}/auth/twitter/callback`;
      console.log("redirectUri", redirectUri);

      // Ensure user is authenticated
      const isAuthenticated = cookieAuthUtils.isAuthenticated();
      if (!isAuthenticated) {
        const next = typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/auth/twitter/callback";
        router.replace(`/login?next=${encodeURIComponent(next)}`);
        return;
      }

      // Let backend handle OAuth 2.0 callback
      const base = getApiBase();
      window.location.href = `${base}/api/twitter/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}&redirectUri=${encodeURIComponent(redirectUri)}`;
      return;
    }

    // Handle OAuth 1.0a callback
    console.log("Twitter OAuth 1.0a callback:", { oauth_token, oauth_verifier });

    // Debug authentication state
    console.log("🔍 Auth debug:", {
      isAuthenticated: cookieAuthUtils.isAuthenticated(),
      user: cookieAuthUtils.getUser(),
      cookies: document.cookie
    });

    // Ensure user is authenticated
    const isAuthenticated = cookieAuthUtils.isAuthenticated();
    if (!isAuthenticated) {
      console.log("❌ User not authenticated, redirecting to login");
      const next = typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/auth/twitter/callback";
      router.replace(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    console.log("✅ User authenticated, proceeding with Twitter callback");

    // Let backend handle OAuth 1.0a callback
    const base = getApiBase();
    window.location.href = `${base}/api/twitter/callback?oauth_token=${encodeURIComponent(oauth_token)}&oauth_verifier=${encodeURIComponent(oauth_verifier)}`;
  }, [searchParams, router]);

  return <p>Connecting your Twitter account...</p>;
}

export default function TwitterCallbackPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <TwitterCallbackContent />
    </Suspense>
  );
}
