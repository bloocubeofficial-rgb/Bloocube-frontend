"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/Components/ui/Button";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email) {
      setError("Please enter your email");
      return;
    }

    try {
      const base = process.env.NEXT_PUBLIC_API_URL as string;
      const res = await fetch(`${base}/api/auth/request-password-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to send reset email");
      }

      setMessage("If an account exists, a reset link has been sent to your email.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-black px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-black/70 backdrop-blur-md rounded-3xl p-8 text-white"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-2 rounded-xl bg-white/10 placeholder:text-white/50 focus:outline-none"
          />
          <Button type="submit"  className="w-full mt-2">
            Send Reset Link
          </Button>
        </form>

        {message && <p className="text-green-400 mt-2 text-center">{message}</p>}
        {error && <p className="text-red-400 mt-2 text-center">{error}</p>}
      </motion.div>
    </section>
  );
};

export default ForgotPasswordPage;
