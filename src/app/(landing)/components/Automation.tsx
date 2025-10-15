"use client";
import React from "react";
import { motion } from "framer-motion";
import { Link as LinkIcon, LineChart, Megaphone } from "lucide-react";

const steps = [
  {
    icon: LinkIcon,
    title: "Connect Accounts",
    desc: "Securely link your social profiles and unify your data pipeline.",
  },
  {
    icon: LineChart,
    title: "AI-Driven Insights",
    desc: "Unlock patterns and recommendations with predictive analytics.",
  },
  {
    icon: Megaphone,
    title: "Amplify & Grow",
    desc: "Schedule, publish, and iterate with intelligent automation.",
  },
];

export default function Automation() {
  return (
    <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 mt-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-5xl font-bold text-white">
          Seamlessly Integrate and{" "}
          <span className="text-gradient-primary">Automate</span>
        </h1>
        <p className="text-sm md:text-xl mt-5 text-zinc-400 mt-2">
          Get started in three simple steps and revolutionize your social
          presence, optimizing workflows and maximizing impact with intelligent
          automation.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="group relative rounded-2xl p-6 bg-white/[0.04] border border-white/10 backdrop-blur text-center hover:border-white/20 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:scale-[1.03] transition-all duration-300 cursor-pointer"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-cyan-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <s.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-base font-semibold text-white group-hover:text-emerald-300 transition-colors duration-300">
                {s.title}
              </h3>
              <p className="text-sm text-zinc-400 mt-1 group-hover:text-zinc-300 transition-colors duration-300">
                {s.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
