"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Button from "@/Components/ui/Button";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import clsx from "clsx";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
];

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <motion.nav
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={clsx(
        "sticky top-0 z-50 w-full transition duration-500",
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
      )}
    >
      <div className="relative">
        {/* Elevated container with rounded sides */}
        <div className="relative r border border-white/10 backdrop-blur-3xl  shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] transition-all duration-500 hover:border-white/20 bg-gradient-to-r from-fuchsia-500/40 via-indigo-500/20 to-indigo-500/20">
          {/* Premium gradient border */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-bl from-fuchsia-500/20 via-purple-500/20 to-indigo-500/20 opacity-0 hover:opacity-100 transition-opacity duration-500" />
          
          {/* Content */}
          <div className="relative z-10">
             <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6">
              <div className="flex h-14 md:h-16 items-center justify-between gap-2">
              {/* Logo */}
              <Link href="/" className="group">
                <motion.div
                  whileHover={{ rotate: 6, scale: 1.05 }}
                  className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 transition-all duration-300 overflow-hidden"
                >
                  <Image
                    src="/logo.png"
                    alt="Bloocube Logo"
                    fill
                    className="object-contain p-1"
                    priority
                  />
                  <div className="transition-opacity duration-300" />
                </motion.div>
              </Link>

              {/* Desktop nav */}
              <div className="hidden md:flex items-center gap-6 lg:gap-8">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={(e) => {
                      const isHash = item.href.startsWith('#') || item.href.startsWith('/#');
                      if (isHash && typeof window !== 'undefined' && window.location.pathname === '/') {
                        e.preventDefault();
                        const hash = item.href.split('#')[1];
                        const el = hash ? document.getElementById(hash) : null;
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          setOpen(false);
                        }
                      }
                    }}
                    className="group relative text-zinc-300/90 hover:text-white transition-all duration-300 py-2 px-4 rounded-lg hover:bg-white/5"
                  >
                    <span className="font-medium">{item.label}</span>
                    <span className="absolute left-4 right-4 -bottom-1 h-px w-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500 transition-all duration-300 group-hover:w-[calc(100%-2rem)]" />
                  </Link>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="hidden md:flex items-center gap-3">
                <Link href="/login">
                  <Button variant="outline" size="sm" className="px-4 py-2 border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-300">
                    Sign In
                  </Button>
                </Link>
                
              </div>

              {/* Mobile menu toggle */}
              <button
                aria-label="Toggle navigation"
                className="md:hidden inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] p-3 text-white hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 hover:scale-105 touch-manipulation"
                onClick={() => setOpen(!open)}
              >
                {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="md:hidden mt-3 rounded-xl border border-white/10 bg-black/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden"
        >
          <div className="max-w-7xl mx-auto px-3 py-3 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block text-zinc-300 hover:text-white transition-all duration-300 py-3 px-3 rounded-lg hover:bg-white/5 text-base"
                onClick={(e) => {
                  const isHash = item.href.startsWith('#') || item.href.startsWith('/#');
                  if (isHash && typeof window !== 'undefined' && window.location.pathname === '/') {
                    e.preventDefault();
                    const hash = item.href.split('#')[1];
                    const el = hash ? document.getElementById(hash) : null;
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                  setOpen(false);
                }}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <Link href="/login" onClick={() => setOpen(false)}>
                <Button variant="outline" size="sm" className="w-full border-white/20 hover:border-white/40 py-3 text-base">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
