"use client";
import React from "react";
import { motion } from "framer-motion";
import { User, Building2, CheckCircle } from "lucide-react";

const personas = [
  {
    title: "Creators",
    icon: User,
    benefits: ["Smart Suggestions", "Auto-scheduling", "Audience insights"],
  },
  {
    title: "Brands",
    icon: Building2,
    benefits: ["Competitor analysis", "Campaign Manager", "Team workflows"],
  },
];

export default function Persona() {
  return (
    <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20  ">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Customer <span className="text-gradient-primary">Persona</span>
        </h2>
        <p className="text-sm text-zinc-400 mt-2">Include Brands details</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {personas.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="group relative rounded-2xl p-6 bg-white/[0.04] border border-white/10 backdrop-blur hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] hover:scale-[1.02] cursor-pointer"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <p.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors duration-300">
                  {p.title}
                </h3>
              </div>
              <ul className="space-y-2">
                {p.benefits.map((b) => (
                  <li
                    key={b}
                    className="text-sm text-zinc-300 flex items-center gap-2 group-hover:text-zinc-200 transition-colors duration-300"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300 transition-colors duration-300" />{" "}
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
