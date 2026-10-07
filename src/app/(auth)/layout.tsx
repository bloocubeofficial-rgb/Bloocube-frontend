import React from "react";
import Navbar from "@/Components/layout/Navbar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />
      {children}
    </div>
  );
}
