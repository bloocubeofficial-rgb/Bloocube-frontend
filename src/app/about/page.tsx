// "use client";
// import React from "react";
// import { motion } from "framer-motion";

// const AboutPage: React.FC = () => {
//   return (
//     <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 md:pt-28 pb-20 sm:pb-28">
//       <div className="text-center mb-12">
//         <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
//           About <span className="text-gradient-primary">Bloocube</span>
//         </h1>
//         <p className="mt-4 text-sm md:text-base text-zinc-300 max-w-2xl mx-auto">
//           We’re building the AI-powered operating system for social media growth—uniting brands and creators with
//           automation, insights, and a seamless marketplace.
//         </p>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <motion.div
//           initial={{ opacity: 0, y: 16 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true, margin: "-100px" }}
//           transition={{ duration: 0.4 }}
//           className="relative rounded-2xl p-6 bg-white/[0.04] border border-white/10 backdrop-blur"
//         >
//           <h3 className="text-white font-semibold mb-2">Our Mission</h3>
//           <p className="text-sm text-zinc-400">Empower every team to create, collaborate, and grow—with clarity and speed.</p>
//         </motion.div>
//         <motion.div
//           initial={{ opacity: 0, y: 16 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true, margin: "-100px" }}
//           transition={{ duration: 0.45, delay: 0.05 }}
//           className="relative rounded-2xl p-6 bg-white/[0.04] border border-white/10 backdrop-blur"
//         >
//           <h3 className="text-white font-semibold mb-2">What We’re Building</h3>
//           <p className="text-sm text-zinc-400">An AI-first suite for planning, publishing, insights, and brand‑creator collaboration.</p>
//         </motion.div>
//         <motion.div
//           initial={{ opacity: 0, y: 16 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true, margin: "-100px" }}
//           transition={{ duration: 0.5, delay: 0.1 }}
//           className="relative rounded-2xl p-6 bg-white/[0.04] border border-white/10 backdrop-blur"
//         >
//           <h3 className="text-white font-semibold mb-2">Why Now</h3>
//           <p className="text-sm text-zinc-400">Content velocity is everything—AI makes quality and speed possible together.</p>
//         </motion.div>
//       </div>
//     </main>
//   );
// };

// export default AboutPage;

"use client";

import React from "react";
import { motion } from "framer-motion";
import Navbar from "@/Components/layout/Navbar";
import Footer from "@/Components/layout/Footer";

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen relative overflow-hidden text-white bg-black">
      {/* Navbar */}
      <Navbar />

      {/* Floating Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-gradient-to-br from-purple-600 via-blue-500 to-teal-400 opacity-20 md:opacity-30 rounded-full blur-[120px] " />
        <div className="absolute top-[30%] -left-20 w-[400px] h-[400px] bg-gradient-to-br from-purple-600 via-blue-500 to-teal-400 opacity-18 md:opacity-28 rounded-full blur-[120px] " />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-500 via-fuchsia-500 to-pink-500 opacity-16 md:opacity-24 rounded-full blur-[140px] " />
        {/* last fgradient */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-green-400 via-green-500 to-black-400 opacity-10 md:opacity-20 rounded-full blur-[150px]" />
      </div>

      {/* Content Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24">
        {/* Heading */}
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6"
          >
            About{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Bloocube
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 text-base sm:text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed"
          >
            We're building the AI-powered operating system for social media
            growth — uniting brands and creators with automation, insights, and
            a seamless marketplace.
          </motion.p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {[
            {
              title: "Our Mission",
              desc: "Empower every team to create, collaborate, and grow—with clarity and speed.",
              icon: (
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              ),
            },
            {
              title: "What We're Building",
              desc: "An AI-first suite for planning, publishing, insights, and brand-creator collaboration.",
              icon: (
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              ),
            },
            {
              title: "Why Now",
              desc: "Content velocity is everything — AI makes quality and speed possible together.",
              icon: (
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ),
            },
          ].map((card, index) => (
            <div
              key={index}
              className="group relative rounded-2xl p-6 sm:p-8 
             bg-[#0F101F]/60 border border-white/10 
             backdrop-blur-xl shadow-md 
             transition-all duration-500 
             overflow-hidden cursor-pointer"
            >
              {/* Gradient overlay appears softly on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 via-purple-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

              {/* Icon section */}
              <div className="relative z-10 flex flex-col items-start space-y-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-fuchsia-500 to-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(217,70,239,0.3)] group-hover:shadow-[0_0_25px_rgba(217,70,239,0.5)] transition-all duration-500">
                  {card.icon}
                </div>

                <h3 className="text-lg sm:text-xl font-semibold text-blue-200 group-hover:text-white transition-colors duration-300">
                  {card.title}
                </h3>
                <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                  {card.desc}
                </p>
              </div>

              {/* Subtle border glow */}
              <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-fuchsia-400/30 transition-all duration-500" />
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AboutPage;
