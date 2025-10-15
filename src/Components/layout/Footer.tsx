"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="relative z-10 border-t border-white/[0.08] py-14 backdrop-blur-md bg-white/[0.02]">
      <div className="max-w-9xl mx-auto px-6 md:px-20">
        {/* Grid Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-20 text-left text-gray-300">
          {/* Logo & Description */}
          <div className="flex flex-col items-start">
            <div className="relative w-20 h-20 mb-3">
              <Image
                src="/logo.png"
                alt="Bloocube Logo"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Your social media workspace powered by{" "}
              <span className="text-white font-medium">AI</span>.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-base">Product</h4>
            <ul className="space-y-2 text-gray-400 text-sm text-left">
              <li>
                <a
                  href="#features"
                  className="hover:text-white transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Use Cases
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Integrations
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-base">
              Resources
            </h4>
            <ul className="space-y-2 text-gray-400 text-sm text-left">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Docs
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-base">Company</h4>
            <ul className="space-y-2 text-gray-400 text-sm text-left">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/[0.08] mt-10 pt-6 text-center">
          <p className="text-gray-500 text-sm tracking-wide">
            &copy; 2025 <span className="text-white font-medium">Bloocube</span>
            . All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
