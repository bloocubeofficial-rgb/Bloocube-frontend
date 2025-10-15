"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import Button from "@/Components/ui/Button";
import { Input } from "@/Components/ui/Input";
import { Label } from "@/Components/ui/Label";
import { Alert, AlertDescription } from "@/Components/ui/Alert";
import {
  Select,
  SelectTrigger,
  SelectItem,
} from "@/Components/ui/Select";
import Link from "next/link";

const SignupPage: React.FC = () => {
  const router = useRouter();
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState("creator");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ✅ Handles Google signup redirect
  const handleGoogle = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) localStorage.setItem("token", "guest");

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
          Authorization: `Bearer ${localStorage.getItem("token") || "guest"}`,
        },
        body: JSON.stringify({ redirectUri: callbackUrl }),
      });

      if (!data.success || !data.authURL)
        return setError(data.message || data.error || "Failed to start Google auth");

      localStorage.setItem("google_state", data.state || "");
      window.location.href = data.authURL;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to start Google auth";
      setError(message);
    }
  };

  // Auto-fill email from URL param
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) setEmail(decodeURIComponent(emailParam));
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
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

    console.log("Signup success for:", email);
    router.push("/login");
  };

  return (
    <section className="relative flex items-center justify-center min-h-[calc(100vh-80px)] overflow-hidden px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-xl p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_0_25px_rgba(99,102,241,0.25)]"
      >
        {/* Glow Elements */}
        <div className="absolute -top-2 -left-2 w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-tl-2xl blur-2xl opacity-40 pointer-events-none" />
        <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-gradient-to-tl from-fuchsia-600 to-cyan-600 rounded-br-2xl blur-2xl opacity-40 pointer-events-none" />

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-semibold bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
            Create your account
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Join us and start your journey today.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name + Email */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Name */}
            <div className="flex-1 space-y-3">
              <Label htmlFor="name" className="text-zinc-300 text-sm block">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9 h-12 bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-base"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex-1 space-y-3">
              <Label htmlFor="email" className="text-zinc-300 text-sm block">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-12 bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-base"
                />
              </div>
            </div>
          </div>

          {/* Password + Confirm */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Password */}
            <div className="flex-1 space-y-3">
              <Label htmlFor="password" className="text-zinc-300 text-sm block">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-9 h-12 bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex-1 space-y-3">
              <Label htmlFor="confirm" className="text-zinc-300 text-sm block">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="pl-9 pr-9 h-12 bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Role Select */}
          <div className="space-y-3">
            <Label htmlFor="role" className="text-zinc-300 text-sm block">
              Select Role
            </Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                className="h-11 bg-white/5 border-white/10 text-white rounded-xl"
              >
                <SelectItem value="creator">Creator</SelectItem>
                <SelectItem value="brand">Brand</SelectItem>
              </SelectTrigger>
            </Select>
          </div>

          {/* Error */}
          {error && (
            <Alert className="bg-red-500/10 border-red-500/20 rounded-lg">
              <AlertDescription className="text-red-400 text-sm">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 rounded-lg text-white font-semibold shadow-md hover:shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-all duration-300 text-base"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Creating...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>Sign Up</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </Button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#050510] text-zinc-400">Or continue with</span>
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
                d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36C16.8 36 11 30.2 11 23S16.8 10 24 10c3.2 0 6.1 1.2 8.3 3.2l5.7-5.7C34.6 4.2 29.6 2 24 2C11.8 2 2 11.8 2 24s9.8 22 22 22c12.1 0 21.6-8.8 21.6-22 0-1.2-.1-2.3-.3-3.5z"
              />
              <path
                fill="#4CAF50"
                d="M24 46c5.2 0 10-1.9 13.6-5.2l-6.3-5.2C29.1 37.2 26.7 38 24 38c-5.3 0-9.7-3.1-11.5-7.6l-6.6 5.1C7.5 40.8 15 46 24 46z"
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
            <span className="text-sm font-medium">Login with Google</span>
          </button>
        </form>

        <p className="mt-5 text-center text-zinc-400 text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-indigo-400 hover:text-fuchsia-400 font-semibold"
          >
            Login
          </Link>
        </p>
      </motion.div>
    </section>
  );
};

export default SignupPage;
