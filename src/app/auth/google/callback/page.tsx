"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getApiBase } from "@/lib/config";
import { cookieAuthUtils } from "@/lib/cookieAuth";

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const storedState = typeof window !== "undefined" ? sessionStorage.getItem("google_state") : null;
    const success = searchParams.get("google");
    const token = searchParams.get("token");
    const message = searchParams.get("message");
    const error = searchParams.get("error");
    const error_description = searchParams.get("error_description");

    // Handle direct success with session token from backend
    if (success === "success" && token) {
      // With HttpOnly cookies, tokens are handled server-side
      // We only need to update user data from the token
      try {
        // Decode the token to get user data (since it's already verified by backend)
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload && payload.id) {
          cookieAuthUtils.updateUserData(payload);
        }
      } catch (err) {
        console.warn('Could not decode token, proceeding with redirect');
      }
      router.replace("/creator/dashboard");
      return;
    }

    if (error) {
      router.replace(`/login?google=error&message=${encodeURIComponent(error_description || error)}`);
      return;
    }

    // Handle OAuth callback flow by forwarding to backend
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    if (!code || !state) {
      router.replace(`/login?google=error&message=Missing+code+or+state`);
      return;
    }

    if (!storedState || storedState !== state) {
      router.replace(`/login?google=error&message=Invalid+state`);
      return;
    }

    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const base = getApiBase();
    window.location.href = `${base}/api/google/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}&redirectUri=${encodeURIComponent(redirectUri)}`;
  }, [searchParams, router]);

  return <p>Signing you in with Google...</p>;
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <GoogleCallbackContent />
    </Suspense>
  );
}


