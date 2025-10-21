"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getApiBase } from "@/lib/config";

function FacebookCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const error_description = searchParams.get("error_description");

    // Handle errors from Facebook
    if (error) {
      router.replace(`/creator/settings?facebook=error&message=${encodeURIComponent(error_description || error)}`);
      return;
    }

    if (!code || !state) {
      router.replace("/creator/settings?facebook=error&message=Missing+code+or+state");
      return;
    }

    const storedState = typeof window !== "undefined" ? sessionStorage.getItem("facebook_state") : null;
    if (!storedState || storedState !== state) {
      router.replace("/creator/settings?facebook=error&message=Invalid+state");
      return;
    }

    const redirectUri = `${window.location.origin}/auth/facebook/callback`;

    // Ensure user is authenticated before initiating flow
    const isAuthenticated = typeof window !== "undefined" ? document.cookie.includes('user_data') : false;
    if (!isAuthenticated) {
      const next = typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/auth/facebook/callback";
      router.replace(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    // Let backend handle callback via GET redirect (no auth header needed)
    const base = getApiBase();
    window.location.href = `${base}/api/facebook/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}&redirectUri=${encodeURIComponent(redirectUri)}`;
  }, [searchParams, router]);

  return <p>Connecting your Facebook account...</p>;
}

export default function FacebookCallbackPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <FacebookCallbackContent />
    </Suspense>
  );
}
