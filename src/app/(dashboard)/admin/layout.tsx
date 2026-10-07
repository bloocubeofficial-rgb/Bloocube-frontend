"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export default function AdminRouteLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || user?.role !== "admin") {
      router.replace("/login");
    }
  }, [isAuthenticated, user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") return null;

  return <>{children}</>;
}
