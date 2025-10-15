"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Users,
  Zap,
  Target,
  Globe,
  Activity,
  PieChart,
} from "lucide-react";

export default function Visualization() {
  // Sample data for charts
  const analyticsData = [
    { label: "Mon", value: 85, color: "from-blue-500 to-cyan-500" },
    { label: "Tue", value: 92, color: "from-cyan-500 to-teal-500" },
    { label: "Wed", value: 78, color: "from-teal-500 to-green-500" },
    { label: "Thu", value: 96, color: "from-green-500 to-emerald-500" },
    { label: "Fri", value: 88, color: "from-emerald-500 to-lime-500" },
    { label: "Sat", value: 74, color: "from-lime-500 to-yellow-500" },
    { label: "Sun", value: 91, color: "from-yellow-500 to-orange-500" },
  ];

  const engagementData = [
    {
      platform: "Instagram",
      percentage: 45,
      color: "from-pink-500 to-rose-500",
    },
    { platform: "Twitter", percentage: 30, color: "from-blue-500 to-sky-500" },
    {
      platform: "LinkedIn",
      percentage: 15,
      color: "from-blue-600 to-indigo-600",
    },
    { platform: "YouTube", percentage: 10, color: "from-red-500 to-red-600" },
  ];

  const metrics = [
    {
      label: "Total Reach",
      value: "2.4M",
      icon: Users,
      color: "from-blue-500 to-purple-500",
    },
    {
      label: "Engagement Rate",
      value: "8.7%",
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500",
    },
    {
      label: "Content Posts",
      value: "156",
      icon: Zap,
      color: "from-yellow-500 to-orange-500",
    },
    {
      label: "Active Campaigns",
      value: "12",
      icon: Target,
      color: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 mt-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
          Visualize Your <span className="text-gradient-primary">Success</span>
        </h1>
        <p className="text-sm md:text-xl mt-4 text-zinc-400 max-w-3xl mx-auto">
          Explore our intuitive dashboards and powerful analytics tools crafted
          to deliver insights that drive your social media success.
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
        {metrics.map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="group relative rounded-xl border border-white/10 bg-white/5 backdrop-blur p-4 hover:border-white/20 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-r ${metric.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
              >
                <metric.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {metric.value}
                </div>
                <div className="text-xs text-zinc-400">{metric.label}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Analytics Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 hover:border-white/20 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] transition-all duration-300"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Weekly Analytics
              </h3>
              <p className="text-sm text-zinc-400">Performance over time</p>
            </div>
          </div>

          <div className="space-y-4">
            {analyticsData.map((item, i) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-8 text-xs text-zinc-400">{item.label}</div>
                <div className="flex-1 bg-zinc-800/50 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${item.value}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                  />
                </div>
                <div className="w-12 text-xs text-zinc-300 text-right">
                  {item.value}%
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Engagement Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 hover:border-white/20 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all duration-300"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <PieChart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Platform Engagement
              </h3>
              <p className="text-sm text-zinc-400">
                Distribution across platforms
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {engagementData.map((item, i) => (
              <div key={item.platform} className="flex items-center gap-3">
                <div className="w-20 text-sm text-zinc-300">
                  {item.platform}
                </div>
                <div className="flex-1 bg-zinc-800/50 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${item.percentage}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: i * 0.1 + 0.5 }}
                    className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                  />
                </div>
                <div className="w-12 text-sm text-zinc-300 text-right">
                  {item.percentage}%
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "AI Analytics Dashboard",
            icon: Activity,
            description: "Real-time insights powered by AI",
            color: "from-blue-500 to-cyan-500",
          },
          {
            label: "Dynamic Content Planner",
            icon: Globe,
            description: "Smart scheduling across platforms",
            color: "from-purple-500 to-pink-500",
          },
          {
            label: "Campaign Manager",
            icon: Target,
            description: "End-to-end campaign optimization",
            color: "from-green-500 to-emerald-500",
          },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 hover:border-white/20 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] hover:scale-[1.02] transition-all duration-300 cursor-pointer"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-r ${card.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors duration-300">
                    {card.label}
                  </h3>
                  <p className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300">
                    {card.description}
                  </p>
                </div>
              </div>

              {/* Mini visualization */}
              <div className="space-y-2">
                <div className="flex gap-1">
                  {[...Array(8)].map((_, j) => (
                    <motion.div
                      key={j}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${Math.random() * 40 + 20}px` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: j * 0.05 + i * 0.1 }}
                      className={`flex-1 bg-gradient-to-t ${card.color} rounded-sm opacity-70 group-hover:opacity-100 transition-opacity duration-300`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
