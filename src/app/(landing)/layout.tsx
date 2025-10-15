"use client";
import React from "react";
import Navbar from "@/Components/layout/Navbar";
import Footer from "@/Components/layout/Footer";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="relative z-10" suppressHydrationWarning={true}>
        <div className="pointer-events-none absolute md:fixed inset-0 z-0 overflow-hidden will-change-transform">
          {/* Decorative layers */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Existing Gradients */}
            <div className="absolute -top-20 -left-80 w-[400px] h-[400px] bg-gradient-to-br from-purple-200 via-blue-500 to-pink-200 opacity-20 md:opacity-20 rounded-full blur-[120px]" />
            <div className="absolute top-[40%] -left-10 w-[700px] h-[600px] bg-gradient-to-br from-black-600 via-blue-500 to-purple-400 opacity-18 md:opacity-18 rounded-full blur-[100px]" />
            <div className="absolute bottom-10 right-30 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-500 via-fuchsia-500 to-pink-500 opacity-16 md:opacity-24 rounded-full blur-[180px]" />

            {/* New Soft Gradient - Top Left */}
            <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-green-400 via-green-500 to-black-400 opacity-10 md:opacity-20 rounded-full blur-[150px]" />
          </div>
        </div>
        {children}
      </div>
      <Footer />
    </div>
  );
}
