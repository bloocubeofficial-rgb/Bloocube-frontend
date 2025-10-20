"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { config, getApiBase } from "@/lib/config";

function TwitterCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    // console.log("code",code)
    // console.log("state",state)

    if (!code || !state) {
      router.replace("/creator/settings?twitter=error&message=Missing+code+or+state");
      return;
    }

    const storedState = typeof window !== "undefined" ? sessionStorage.getItem("twitter_state") : null;
    // console.log("storedState",storedState)
    if (!storedState || storedState !== state) {
      router.replace("/creator/settings?twitter=error&message=Invalid+state");
      return;
    }

    const redirectUri = config.twitter.callbackUrl || `${window.location.origin}/auth/twitter/callback`;
    console.log("redirectUri",redirectUri)

    // Ensure app JWT exists before initiating flow (auth-url is protected)
    // With HttpOnly cookies, tokens are handled server-side
    // We only need to check if user is authenticated
    const isAuthenticated = typeof window !== "undefined" ? document.cookie.includes('user_data') : false;
    // console.log("token",token)
    if (!isAuthenticated) {
      const next = typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/auth/twitter/callback";
      router.replace(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    // Let backend handle callback via GET redirect (no auth header needed)
    const base = getApiBase();
    window.location.href = `${base}/api/twitter/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}&redirectUri=${encodeURIComponent(redirectUri)}`;
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
