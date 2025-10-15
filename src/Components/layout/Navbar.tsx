"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Button from "@/Components/ui/Button";
import React, { useState } from "react";
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
  const [open, setOpen] = useState(false);

  return (
    <motion.nav initial={false} className="sticky top-0 z-50 w-full">
      {/* Main Nav Wrapper */}
      <div className="relative w-full">
        <div className="relative bg-black border-b border-white/5 transition-all duration-300 hover:bg-black/90">
          {/* Nav Content */}
          <div className="relative z-10 w-full max-w-full mx-auto px-4 sm:px-8 md:px-16">
            <div className="flex h-18 items-center justify-between">
              {/* Logo */}
              <Link href="/" className="group">
                <motion.div
                  whileHover={{ scale: 1.08, rotate: 3 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="relative w-20 h-20 overflow-hidden"
                >
                  <Image
                    src="/logo.png"
                    alt="Bloocube Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </motion.div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-8">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="group relative text-zinc-300 hover:text-white transition-all duration-300"
                  >
                    <span className="font-medium">{item.label}</span>
                    <span className="absolute left-0 bottom-0 h-[2px] w-0 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 transition-all duration-300 group-hover:w-full rounded-full" />
                  </Link>
                ))}
              </div>

              {/* Sign In Button (Desktop) */}
              <div className="hidden md:flex items-center gap-3">
                <Link href="/login">
                  <Button
                    variant="outline"
                    size="md"
                    className="px-5 py-2 rounded-full border border-white/20 bg-black/10 text-white hover:bg-black/20 hover:border-white/40 transition-all duration-300 backdrop-blur-md shadow-[0_0_10px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>

              {/* Mobile Menu Toggle */}
              <button
                aria-label="Toggle navigation"
                className="md:hidden inline-flex items-center justify-center p-3 text-white rounded-xl bg-black/20 border border-white/10 hover:bg-black/30 hover:border-white/20 transition-all duration-300"
                onClick={() => setOpen(!open)}
              >
                {open ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="md:hidden border-t border-white/10 bg-black/80 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
        >
          <div className="px-6 py-5 space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block text-zinc-300 hover:text-white transition-all duration-200 py-2 px-3 rounded-lg hover:bg-black/30"
              >
                {item.label}
              </Link>
            ))}

            <div className="pt-3 border-t border-white/10">
              <Link href="/login" onClick={() => setOpen(false)}>
                <Button
                  variant="outline"
                  size="md"
                  className="w-full border-white/20 bg-black/10 hover:bg-black/20 text-white rounded-full backdrop-blur-md"
                >
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
