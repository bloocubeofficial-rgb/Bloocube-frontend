"use client";

import { FileText, Users, MessageSquare, CreditCard, TrendingUp } from "lucide-react";

const STEPS = [
  { icon: FileText, title: "Create a Campaign", desc: "Tell us your goals, budget and deliverables." },
  { icon: Users, title: "Receive Bids", desc: "Creators apply or bid with their proposals." },
  { icon: MessageSquare, title: "Select & Collaborate", desc: "Compare profiles, chat and finalize." },
  { icon: CreditCard, title: "Secure Payment", desc: "Funds are held in escrow until approval." },
  { icon: TrendingUp, title: "Track & Grow", desc: "Manage deliverables and measure results." },
];

export default function HowItWorks() {
  return (
    <section className="py-16 bg-[var(--brand-lavender)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-bold text-slate-900">How BlooCube works</h2>
        <p className="text-slate-600 mt-2 max-w-xl">
          A simple and transparent process from campaign brief to final delivery.
        </p>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-5 gap-6">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="relative bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold mb-3">
                  {i + 1}
                </div>
                <Icon className="w-5 h-5 text-indigo-500 mb-2" />
                <div className="font-semibold text-slate-900 text-sm">{s.title}</div>
                <div className="text-xs text-slate-500 mt-1">{s.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
