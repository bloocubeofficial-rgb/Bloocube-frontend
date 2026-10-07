import React from "react";
import Navbar from "@/Components/layout/Navbar";
import Footer from "@/Components/layout/Footer";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <div className="relative">{children}</div>
      <Footer />
    </div>
  );
}
