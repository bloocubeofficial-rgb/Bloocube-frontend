"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, RefreshCw } from "lucide-react";
import Button from "@/Components/ui/Button";
import { Input } from "@/Components/ui/Input";
import { Label } from "@/Components/ui/Label";
import { Alert, AlertDescription } from "@/Components/ui/Alert";
import Link from "next/link";
import { apiRequest } from "@/lib/apiClient";

const VerifyOTPForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!email) {
      router.push("/signup");
      return;
    }

    // Start countdown timer
    setCountdown(600); // 10 minutes
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, router]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit code");
      setIsLoading(false);
      return;
    }

    try {
      const data = await apiRequest<{
        success: boolean;
        data: {
          user: any;
          tokens: { accessToken: string; refreshToken?: string };
        };
        message?: string;
      }>("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      if (data?.data?.user) {
        // With HttpOnly cookies, tokens are automatically set by the server
        // We only need to update user data in the frontend
        const { cookieAuthUtils } = await import("@/lib/cookieAuth");
        cookieAuthUtils.updateUserData(data.data.user);

        setMessage("Email verified successfully! Redirecting...");
        setTimeout(() => {
          const role = data.data.user?.role;
          router.push(role === "brand" ? "/brand" : "/creator");
        }, 2000);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Verification failed";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) return;

    setError(null);
    setMessage(null);
    setIsResending(true);

    try {
      await apiRequest("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      setMessage("Verification code sent to your email");
      setCountdown(600); // Reset countdown
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to resend code";
      setError(message);
    } finally {
      setIsResending(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
  };

  if (!email) {
    return null;
  }

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#050510] px-4 py-6">
      {/* Animated glowing background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[450px] h-[450px] bg-gradient-to-br from-indigo-600/30 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-[450px] h-[450px] bg-gradient-to-tr from-fuchsia-600/30 to-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-full blur-3xl opacity-50" />
      </div>

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_0_40px_rgba(99,102,241,0.25)] p-6 sm:p-8"
      >
        <div className="absolute -top-2 -left-2 w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-tl-3xl blur-2xl opacity-50" />
        <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-gradient-to-tl from-fuchsia-600 to-cyan-600 rounded-br-3xl blur-2xl opacity-50" />

        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
            Verify Your Email
          </h2>
          <p className="text-zinc-400 text-sm mt-2">
            We've sent a 6-digit code to
          </p>
          <p className="text-indigo-400 font-medium">{email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="otp" className="text-zinc-300 text-sm mb-2 block">
              Verification Code
            </Label>
            <Input
              id="otp"
              type="text"
              placeholder="000000"
              value={otp}
              onChange={handleOtpChange}
              className="h-12 text-center text-2xl font-mono tracking-widest bg-white/5 border-white/10 text-white placeholder:text-zinc-500 rounded-xl focus:ring-2 focus:ring-indigo-500/30"
              maxLength={6}
            />
            <div className="mt-2 text-xs text-zinc-400 text-center">
              {countdown > 0 ? (
                <span>Code expires in {formatTime(countdown)}</span>
              ) : (
                <span className="text-red-400">Code has expired</span>
              )}
            </div>
          </div>

          {error && (
            <Alert className="bg-red-500/10 border-red-500/20 rounded-xl">
              <AlertDescription className="text-red-400 text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {message && (
            <Alert className="bg-emerald-500/10 border-emerald-500/20 rounded-xl">
              <AlertDescription className="text-emerald-400 text-sm">{message}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={isLoading || otp.length !== 6 || countdown === 0}
            className="w-full h-12 bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 rounded-xl text-white font-semibold shadow-lg hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Verifying...</span>
              </div>
            ) : (
              "Verify Email"
            )}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={isResending || countdown > 0}
              className="text-indigo-400 hover:text-fuchsia-400 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Resend Code
                </>
              )}
            </button>
          </div>

          <div className="pt-4 border-t border-white/10">
            <Link
              href="/signup"
              className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign Up
            </Link>
          </div>
        </form>
      </motion.div>
    </section>
  );
};

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#050510]">
    <div className="text-white text-center">
      <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
      <p>Loading verification page...</p>
    </div>
  </div>
);

const VerifyOTPPage: React.FC = () => (
  <Suspense fallback={<LoadingFallback />}>
    <VerifyOTPForm />
  </Suspense>
);

export default VerifyOTPPage;
