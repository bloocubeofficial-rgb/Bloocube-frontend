"use client";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles, Users, Mail } from "lucide-react";
import Image from "next/image";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";
import img2 from "@/assets/img2.png";

import img3 from "@/assets/img3.png";

import img5 from "@/assets/img5.png";
// import img6 from "@/Components/assets/img6.png";

const allIcons = [
  { icon: "", mode: "creator", img: img2, color: "" },
  { icon: FaYoutube, mode: "brand", color: "text-red-600" },
  { icon: "", mode: "creator", img: img3, color: "" },
  { icon: FaLinkedinIn, mode: "brand", color: "text-blue-500" },
  { icon: FaFacebookF, mode: "brand", color: "text-blue-700" },
  { icon: FaInstagram, mode: "brand", color: "text-pink-500" },
  { icon: "", mode: "creator", img: img5, color: "" },
  { icon: FaTwitter, mode: "brand", color: "text-sky-400" },
  // { icon: "", mode: "creator", img: img6, color: "" },
];

const Hero = React.memo(() => {
  const [activeMode, setActiveMode] = useState("creator");
  const [email, setEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMode((prev) => (prev === "creator" ? "brand" : "creator"));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const firstRender = useRef(true);
  const prefersReducedMotion = useReducedMotion();
  const orbit1Items = useMemo(() => allIcons.slice(0, 4), []);
  const orbit2Items = useMemo(() => allIcons.slice(4, 8), []);

  return (
    <div className="relative min-h-screen overflow-hidden text-white ">
      <section className="relative z-10 max-w-7xl mt-8 md:mt-18 mx-auto px-4 sm:px-6 pt-12 pb-10 flex flex-col lg:flex-row items-center lg:items-start gap-10">
        {/* LEFT SECTION */}
        <div className="flex-1 text-center lg:text-left w-full">
          {/* Animated Mode Button */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMode}
              initial={firstRender.current ? false : { opacity: 0, x: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="flex justify-center lg:justify-start mb-6"
              onAnimationComplete={() => {
                firstRender.current = false;
              }}
            >
              <button
                className={`flex items-center gap-2 px-5 py-2 rounded-full border shadow-lg transition-all duration-300 hover:scale-105 ${
                  activeMode === "creator"
                    ? "border-cyan-400 text-cyan-400 hover:shadow-cyan-500/40"
                    : "border-purple-400 text-purple-400 hover:shadow-purple-500/40"
                }`}
              >
                {activeMode === "creator" ? (
                  <Sparkles className="w-4 h-4" />
                ) : (
                  <Users className="w-4 h-4" />
                )}
                {activeMode === "creator" ? "Creator" : "Brand"}
              </button>
            </motion.div>
          </AnimatePresence>

          {/* Animated Heading */}
          <AnimatePresence mode="wait">
            <motion.h1
              key={activeMode}
              initial={firstRender.current ? false : { opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.35, type: "tween", ease: "easeOut" }}
              onAnimationComplete={() => {
                firstRender.current = false;
              }}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 sm:mb-6 text-white leading-snug"
            >
              {activeMode === "creator" ? (
                <>
                  Launch Your{" "}
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    Next Creator Campaign
                  </span>{" "}
                  in Minutes
                </>
              ) : (
                <>
                  Redefining{" "}
                  <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                    How Brands & Creators
                  </span>{" "}
                  Grow Together
                </>
              )}
            </motion.h1>
          </AnimatePresence>

          {/* Static Paragraph */}
          <p className="text-zinc-300 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 mt-3 sm:mt-4 mb-6 sm:mb-8">
            {activeMode === "creator"
              ? "Discover verified creators, manage payments, and measure ROI — all in one platform."
              : "Join our exclusive private beta and experience smarter collaborations with AI technology."}
          </p>

          {/* Email Input */}
          <div className="w-full max-w-xl mb-8 mt-8 mx-auto lg:mx-0 relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none z-10" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your work email..."
              className="w-full rounded-xl pr-20 pl-12 py-3 sm:py-4 text-sm sm:text-base text-white placeholder-gray-400 bg-black/30 backdrop-blur-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all duration-300"
            />

            <button
              type="button"
              onClick={() => {
                const trimmed = email.trim();
                if (!trimmed) return;
                const encoded = encodeURIComponent(trimmed);
                router.push(`/signup?email=${encoded}`);
              }}
              className="absolute top-1/2 right-2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-black/40 border border-white/20 backdrop-blur-xl text-white shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:bg-white/10 hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-all duration-300"
            >
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>

          <p className="text-sm text-zinc-300 text-center lg:text-left mt-3">
            By continuing you agree to our Terms and Privacy Policy.
          </p>
        </div>

        {/* RIGHT SECTION - ORBITAL ICONS / IMAGES */}
        <div className="flex-shrink-0 flex justify-center w-full lg:w-auto">
          {/* Container scales responsively */}
          <div className="relative w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] md:w-[400px] md:h-[400px] lg:w-[450px] lg:h-[450px]">
            {/* Center Circle - responsive sizing */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-44 lg:h-44 rounded-full bg-black/10 border border-white/50 flex flex-col items-center justify-center backdrop-blur-md">
                <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                  20k+
                </span>
                <span className="text-xs sm:text-sm text-zinc-300">
                  Specialists
                </span>
              </div>
            </div>

            {/* Orbit 1 - responsive sizing */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30"
              style={{
                width: "clamp(160px, 58%, 260px)",
                height: "clamp(160px, 58%, 260px)",
                aspectRatio: "1/1",
                willChange: "transform",
              }}
              animate={prefersReducedMotion ? { rotate: 0 } : { rotate: 360 }}
              transition={
                prefersReducedMotion
                  ? undefined
                  : { repeat: Infinity, duration: 40, ease: "linear" }
              }
            >
              {orbit1Items.map((item, i) => {
                const angle = (i / 4) * 2 * Math.PI;
                const x = 50 + 50 * Math.cos(angle);
                const y = 50 + 50 * Math.sin(angle);
                const isActive = activeMode === item.mode;

                return (
                  <motion.div
                    key={`orbit1-${i}`}
                    className={`absolute w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-full border transition-all duration-300 ${
                      isActive
                        ? "border-white/40 bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.5)] scale-110"
                        : "border-white/10 bg-white/5 opacity-50 scale-95"
                    }`}
                    style={{
                      left: `calc(${x}% - 1.25rem)`,
                      top: `calc(${y}% - 1.25rem)`,
                    }}
                  >
                    {item.mode === "creator" && item.img ? (
                      <Image
                        src={item.img}
                        alt={`creator-${i}`}
                        className="w-full h-full object-cover rounded-full"
                        loading="lazy"
                        sizes="(max-width: 640px) 32px, (max-width: 1024px) 36px, 40px"
                      />
                    ) : (
                      <div className="w-full h-full rounded-xl bg-black/60 backdrop-blur-md border border-white/40 p-1.5 sm:p-2 flex items-center justify-center shadow-lg">
                        {item.icon && (
                          <item.icon
                            className={`text-sm sm:text-base lg:text-lg ${item.color}`}
                          />
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Orbit 2 - responsive sizing */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30"
              style={{
                width: "clamp(240px, 89%, 400px)",
                height: "clamp(240px, 89%, 400px)",
                aspectRatio: "1/1",
                willChange: "transform",
              }}
              animate={prefersReducedMotion ? { rotate: 0 } : { rotate: -360 }}
              transition={
                prefersReducedMotion
                  ? undefined
                  : { repeat: Infinity, duration: 70, ease: "linear" }
              }
            >
              {orbit2Items.map((item, i) => {
                const angle = (i / 4) * 2 * Math.PI;
                const x = 50 + 50 * Math.cos(angle);
                const y = 50 + 50 * Math.sin(angle);
                const isActive = activeMode === item.mode;

                return (
                  <motion.div
                    key={`orbit2-${i}`}
                    className={`absolute w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-full border transition-all duration-300 ${
                      isActive
                        ? "border-white/40 bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.5)] scale-110"
                        : "border-white/10 bg-white/5 opacity-50 scale-95"
                    }`}
                    style={{
                      left: `calc(${x}% - 1.25rem)`,
                      top: `calc(${y}% - 1.25rem)`,
                    }}
                  >
                    {item.mode === "creator" && item.img ? (
                      <Image
                        src={item.img}
                        alt={`creator-${i}`}
                        className="w-full h-full object-cover rounded-full"
                        loading="lazy"
                        sizes="(max-width: 640px) 32px, (max-width: 1024px) 36px, 40px"
                      />
                    ) : (
                      <div className="w-full h-full rounded-xl bg-black/60 backdrop-blur-md border border-white/40 p-1.5 sm:p-2 flex items-center justify-center shadow-lg">
                        {item.icon && (
                          <item.icon
                            className={`text-sm sm:text-base lg:text-lg ${item.color}`}
                          />
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
});

export default Hero;

//  hero section complete
