"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { loadingManager } from "@/lib/loading";
import TopProgressBar from "@/Components/ui/TopProgressBar";

export default function RouteProgress() {
  const pathname = usePathname();
  const firstActiveAtRef = useRef<number | null>(null);
  const watchdogRef = useRef<number | null>(null);

  useEffect(() => {
    // Navigation progress disabled per requirements (manual refresh only)
  }, []);

  useEffect(() => {
    // Disable automatic route progress on pathname change
  }, [pathname]);

  // Watchdog: if global loading stays active too long (e.g., due to an unbalanced start/done), auto-reset
  useEffect(() => {
    const unsubscribe = loadingManager.subscribe((activeCount) => {
      const now = Date.now();
      if (activeCount > 0) {
        if (firstActiveAtRef.current === null) firstActiveAtRef.current = now;
        // Kick a watchdog timer that will reset after 6s of continuous activity
        if (watchdogRef.current) window.clearTimeout(watchdogRef.current);
        watchdogRef.current = window.setTimeout(() => {
          // If still active and has been > 6s, force reset to prevent stuck spinners
          if (firstActiveAtRef.current && Date.now() - firstActiveAtRef.current > 6000) {
            loadingManager.reset();
            firstActiveAtRef.current = null;
          }
        }, 6000);
      } else {
        firstActiveAtRef.current = null;
        if (watchdogRef.current) {
          window.clearTimeout(watchdogRef.current);
          watchdogRef.current = null;
        }
      }
    });
    return () => {
      if (watchdogRef.current) window.clearTimeout(watchdogRef.current);
      unsubscribe();
    };
  }, []);

  return <TopProgressBar />;
}


