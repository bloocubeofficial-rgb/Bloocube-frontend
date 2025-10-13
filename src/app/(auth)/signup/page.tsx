"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
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
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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

    try {
      const data = await apiRequest<{
        success: boolean;
        data: {
          tokens?: { accessToken: string; refreshToken?: string };
          user?: { role: string };
        };
        message?: string;
      }>("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (data?.data?.tokens?.accessToken && data?.data?.user) {
        localStorage.setItem("token", data.data.tokens.accessToken);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        const role = data.data.user?.role;
        router.push(role === "brand" ? "/brand" : "/creator");
      } else {
        // fallback: auto-login
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

        localStorage.setItem("token", loginResp.data.tokens.accessToken);
        if (loginResp.data.tokens.refreshToken)
          localStorage.setItem(
            "refreshToken",
            loginResp.data.tokens.refreshToken
          );
        localStorage.setItem("user", JSON.stringify(loginResp.data.user));

        const roleAfterSignup = loginResp.data.user?.role;
        router.push(roleAfterSignup === "brand" ? "/brand" : "/creator");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Network error. Please try again later.");
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
                ✨ Email pre-filled from landing page
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
            </div>
          </div>

          {/* Password + Confirm */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Label htmlFor="password" className="text-zinc-300 text-sm mb-2 block">
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
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="relative">
              <Label htmlFor="confirm" className="text-zinc-300 text-sm mb-2 block">
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
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Role */}
          <div>
            <Label htmlFor="role" className="text-zinc-300 text-sm mb-2 block">
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

          {error && (
            <Alert className="bg-red-500/10 border-red-500/20 rounded-xl">
              <AlertDescription className="text-red-400 text-sm">{error}</AlertDescription>
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
  <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Loading...</div>}>
    <SignupForm />
  </Suspense>
);

export default SignupPage;
