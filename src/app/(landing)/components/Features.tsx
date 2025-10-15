"use client";
import React from "react";
import { motion } from "framer-motion";
import { Target, Globe, Shield, Bolt, BarChart3, Users } from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Smart Targeting",
    desc: "AI-powered audience segmentation for maximum impact",
  },
  {
    icon: Globe,
    title: "Global Reach",
    desc: "Expand your presence across all major social platforms",
  },
  {
    icon: Shield,
    title: "Brand Safety",
    desc: "Protect your brand with intelligent content monitoring",
  },
  {
    icon: Bolt,
    title: "Automation",
    desc: "Streamline workflows with intelligent automation",
  },
  {
    icon: BarChart3,
    title: "Deep Analytics",
    desc: "Comprehensive insights into your social performance",
  },
  {
    icon: Users,
    title: "Team Sync",
    desc: "Collaborate seamlessly with your entire team",
  },
];

const Features: React.FC = () => {
  return (
    <section
      id="features"
      className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 mt-8"
    >
      <div className="text-center mb-20">
        <h1 className="text-2xl md:text-5xl font-bold mb-2 text-white">
          Unleash the Power of{" "}
          <span className="text-gradient-primary">AI-Driven</span> Marketing
        </h1>
        <p className="text-sm  md:text-xl  mt-4 text-zinc-400 max-w-2xl mx-auto">
          Transform your social media strategy with our cutting-edge features,
          designed to enable comprehensive control and predictive insights for
          unparalleled growth.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="group relative rounded-2xl p-6 bg-white/[0.04] border border-white/10 backdrop-blur hover:border-white/20 hover:shadow-[0_0_30px_rgba(99,102,241,0.25)] hover:scale-[1.03] transition-all duration-300 cursor-pointer"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-base font-semibold mb-2 text-white group-hover:text-blue-300 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed group-hover:text-zinc-300 transition-colors duration-300">
                {feature.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Features;
