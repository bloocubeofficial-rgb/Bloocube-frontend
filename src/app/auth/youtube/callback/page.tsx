"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getApiBase } from "@/lib/config";

function YouTubeCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) {
      router.replace("/creator/settings?youtube=error&message=Missing+code+or+state");
      return;
    }

    const storedState = typeof window !== "undefined" ? sessionStorage.getItem("youtube_state") : null;
    if (!storedState || storedState !== state) {
      router.replace("/creator/settings?youtube=error&message=Invalid+state");
      return;
    }

    const redirectUri = `${window.location.origin}/auth/youtube/callback`;
    console.log("redirectUri", redirectUri);

    // Ensure app JWT exists before initiating flow (auth-url is protected)
    // With HttpOnly cookies, tokens are handled server-side
    // We only need to check if user is authenticated
    const isAuthenticated = typeof window !== "undefined" ? document.cookie.includes('user_data') : false;
    if (!isAuthenticated) {
      const next = typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/auth/youtube/callback";
      router.replace(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    // Let backend handle callback via GET redirect (no auth header needed)
    const base = getApiBase();
    window.location.href = `${base}/api/youtube/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}&redirectUri=${encodeURIComponent(redirectUri)}`;
  }, [searchParams, router]);

  return <p>Connecting your YouTube account...</p>;
}

export default function YouTubeCallbackPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <YouTubeCallbackContent />
    </Suspense>
  );
}
