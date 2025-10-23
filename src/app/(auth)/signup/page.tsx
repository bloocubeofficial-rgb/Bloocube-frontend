"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import Button from "@/Components/ui/Button";
import { Input } from "@/Components/ui/Input";
import { Label } from "@/Components/ui/Label";
import { Alert, AlertDescription } from "@/Components/ui/Alert";
import { Select, SelectItem, SelectTrigger } from "@/Components/ui/Select";
import Link from "next/link";
import { apiRequest } from "@/lib/apiClient";

const SignupForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState("creator");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);

  // ✅ Handles Google signup redirect
  const handleGoogle = async () => {
    try {
      // With HttpOnly cookies, we don't need to set guest tokens
      // The server will handle authentication via cookies

      const callbackUrl = `${window.location.origin}/auth/google/callback`;
      const data = await apiRequest<{
        success: boolean;
        authURL?: string;
        state?: string;
        message?: string;
        error?: string;
      }>("/api/google/auth-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ redirectUri: callbackUrl }),
      });

      if (!data.success || !data.authURL)
        return setError(
          data.message || data.error || "Failed to start Google auth"
        );

      // Store OAuth state in sessionStorage for security
      if (typeof window !== "undefined") {
        sessionStorage.setItem("google_state", data.state || "");
      }
      window.location.href = data.authURL;
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Failed to start Google auth";
      setError(message);
    }
  };

  // Auto-fill email from URL param
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) setEmail(decodeURIComponent(emailParam));
  }, [searchParams]);

  // Debounced email existence check
  useEffect(() => {
    if (!email) {
      setEmailExists(null);
      return;
    }
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        setCheckingEmail(true);
        const qs = new URLSearchParams({ email });
        const res = await fetch(`/api/auth/check-email?${qs.toString()}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (data?.success) setEmailExists(!!data.data?.exists);
        else setEmailExists(null);
      } catch {
        setEmailExists(null);
      } finally {
        setCheckingEmail(false);
      }
    }, 400);
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    if (!name || !email || !password || !confirm) {
      setError("All fields are required");
      setIsLoading(false);
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      if (emailExists) {
        setError(
          "Email already exists. Please log in or use a different email."
        );
        setIsLoading(false);
        return;
      }
      const data = await apiRequest<{
        success: boolean;
        data: {
          requiresOTP?: boolean;
          user?: { role: string };
        };
        message?: string;
      }>("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (data?.data?.requiresOTP) {
        // Show success message and redirect to OTP verification
        setMessage(
          "Registration successful! Please check your email for the verification code."
        );
        setTimeout(() => {
          router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
        }, 2000);
      } else {
        // Fallback: try auto-login (for backward compatibility)
        const loginResp = await apiRequest<{
          success: boolean;
          data: {
            tokens: { accessToken: string; refreshToken?: string };
            user: { role: string };
          };
          message?: string;
        }>("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        // With HttpOnly cookies, tokens are automatically set by the server
        // We only need to update user data in the frontend
        const { cookieAuthUtils } = await import("@/lib/cookieAuth");
        cookieAuthUtils.updateUserData(loginResp.data.user);

        const roleAfterSignup = loginResp.data.user?.role;
        router.push(roleAfterSignup === "brand" ? "/brand" : "/creator");
      }
    } catch (err) {
      console.error("Signup error:", err);
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

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
        className="relative z-10 w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_0_40px_rgba(99,102,241,0.25)] p-6 sm:p-8"
      >
        <div className="absolute -top-2 -left-2 w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-tl-3xl blur-2xl opacity-50" />
        <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-gradient-to-tl from-fuchsia-600 to-cyan-600 rounded-br-3xl blur-2xl opacity-50" />

        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
            Create Your Account
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Join thousands of creators and brands
          </p>
          {searchParams.get("email") && (
            <div className="mt-3 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <p className="text-sm text-emerald-300">
                Email pre-filled from landing page
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <Label htmlFor="name" className="text-zinc-300 text-sm mb-2 block">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 rounded-xl focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-zinc-300 text-sm mb-2 block">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 rounded-xl focus:ring-2 focus:ring-indigo-500/30"
              />
              {email && (
                <div className="mt-2 text-xs">
                  {checkingEmail && (
                    <span className="text-zinc-400">Checking email…</span>
                  )}
                  {!checkingEmail && emailExists === true && (
                    <span className="text-red-400">
                      Email already exists. Try logging in.
                    </span>
                  )}
                  {!checkingEmail && emailExists === false && (
                    <span className="text-emerald-400">
                      Email is available.
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Password + Confirm */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Label
                htmlFor="password"
                className="text-zinc-300 text-sm mb-2 block"
              >
                Password
              </Label>
              <Lock className="absolute left-3 top-[38px] w-5 h-5 text-zinc-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 rounded-xl focus:ring-2 focus:ring-indigo-500/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-zinc-400 hover:text-white"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="relative">
              <Label
                htmlFor="confirm"
                className="text-zinc-300 text-sm mb-2 block"
              >
                Confirm Password
              </Label>
              <Lock className="absolute left-3 top-[38px] w-5 h-5 text-zinc-400" />
              <Input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="pl-10 pr-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 rounded-xl focus:ring-2 focus:ring-indigo-500/30"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-[38px] text-zinc-400 hover:text-white"
              >
                {showConfirm ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Role */}
          <div>
            <Label htmlFor="role" className="text-zinc-300 text-sm mb-2 block">
              Select Role
            </Label>
            <Select>
              <SelectTrigger
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="h-11 w-full bg-[#201F2E] border-white/10 text-white placeholder:text-zinc-500 rounded-xl focus:ring-2 focus:ring-indigo-500/30"
              >
                <option value="" disabled className="text-zinc-100">
                  Select your role...
                </option>
                <SelectItem value="creator" className="cursor-pointer">
                  Creator
                </SelectItem>
                <SelectItem value="brand" className="cursor-pointer">
                  Brand
                </SelectItem>
              </SelectTrigger>
            </Select>
          </div>

          {error && (
            <Alert className="bg-red-500/10 border-red-500/20 rounded-xl">
              <AlertDescription className="text-red-400 text-sm">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {message && (
            <Alert className="bg-emerald-500/10 border-emerald-500/20 rounded-xl">
              <AlertDescription className="text-emerald-400 text-sm">
                {message}
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 rounded-xl text-white font-semibold shadow-lg hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all duration-300"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Creating account...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>Sign Up</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            )}
          </Button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4  text-zinc-400">Or continue with</span>
            </div>
          </div>

          {/* Google Signup */}
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all duration-300 hover:scale-105"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36 16.8 36 11 30.2 11 23S16.8 10 24 10c3.2 0 6.1 1.2 8.3 3.2l5.7-5.7C34.6 4.2 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c12.1 0 21.6-8.8 21.6-22 0-1.2-.1-2.3-.3-3.5z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.9 16.3 19.1 14 24 14c3.2 0 6.1 1.2 8.3 3.2l5.7-5.7C34.6 4.2 29.6 2 24 2 15 2 7.5 7.2 6.3 14.7z"
              />
              <path
                fill="#4CAF50"
                d="M24 46c5.2 0 10-1.9 13.6-5.2l-6.3-5.2C29.1 37.2 26.7 38 24 38c-5.3 0-9.7-3.1-11.5-7.6l-6.6 5.1C7.5 40.8 15 46 24 46z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-1.1 2.6-3.1 4.7-5.7 6.1l6.3 5.2C38.9 36.5 42 30.9 42 24c0-1.2-.1-2.3-.4-3.5z"
              />
            </svg>

            <span className="text-sm font-medium">Sign up with Google</span>
          </button>

          <p className="mt-5 text-center text-zinc-400 text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-indigo-400 hover:text-fuchsia-400 font-semibold transition-colors"
            >
              Login
            </Link>
          </p>
        </form>
      </motion.div>
    </section>
  );
};

const SignupPage: React.FC = () => (
  <Suspense
    fallback={
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    }
  >
    <SignupForm />
  </Suspense>
);

export default SignupPage;
