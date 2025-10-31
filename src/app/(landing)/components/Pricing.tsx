"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/Components/ui/Button';
import { CheckCircle } from 'lucide-react';

type Plan = {
  name: string;
  price: number;
  features: string[];
  popular?: boolean;
};

const plans: Plan[] = [
  { name: "Starter", price: 499, features: ["5 Social Accounts", "Basic Analytics", "Content Calendar", "Email Support", "AI Caption Generation", "Basic Scheduling"] },
  { name: "Pro", price: 1299, features: ["15 Social Accounts", "Advanced Analytics", "Team Collaboration", "Priority Support", "Custom Reports", "AI Content Suggestions", "Competitor Analysis", "Advanced Scheduling"], popular: true },
  { name: "Enterprise", price: 2999, features: ["Unlimited Accounts", "White-label Solution", "API Access", "Dedicated Manager", "Custom Integrations", "Advanced AI Features", "Custom Branding", "24/7 Support"] },
];

const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
      <div className="text-center mb-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-white">Flexible Plans for Every<span className="text-gradient-primary">Vision</span></h2>
        <p className="text-sm text-zinc-400 max-w-2xl mx-auto mb-6">Choose the perfect plan to accelerate your social media journey, tailored to scale with your ambitions and deliver unmatched value and capabilities.</p>
        
        {/* Early Access Offer */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-medium">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
          Early Access: First 100 users get 1 month free + priority support
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className={`group relative rounded-2xl p-6 bg-white/5 border ${plan.popular ? 'border-indigo-400/40' : 'border-white/10'} backdrop-blur hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:scale-[1.02] transition-all duration-300 cursor-pointer`}
          >
            <div className={`absolute inset-0 rounded-2xl ${plan.popular ? 'bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10' : 'bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-teal-500/10'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-1.5 rounded-full text-xs font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.35)]">Most Popular</div>
            )}
            <div className="relative z-10">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2 text-white group-hover:text-blue-300 transition-colors duration-300">{plan.name}</h3>
                <div className="text-3xl font-bold mb-2 text-white group-hover:text-white transition-colors duration-300">
                  Coming Soon
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-zinc-300 group-hover:text-zinc-200 transition-colors duration-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300 group-hover:scale-110 transition-all duration-300" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {plan.popular ? (
                <Button
                  className="w-full bg-white/10 backdrop-blur-md border border-white/20 group-hover:scale-105 transition-transform duration-300 text-white hover:bg-white/20 shadow-md hover:shadow-lg"
                >
                  Choose Pro
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full bg-white/10 backdrop-blur-md border border-white/20 group-hover:scale-105 transition-transform duration-300 text-white hover:text-white hover:bg-white/20 shadow-md hover:shadow-lg"
                >
                  Get Started
                </Button>)}
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Additional Information */}
      <div className="mt-16 text-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur">
            <h3 className="text-lg font-semibold text-white mb-2">No Hidden Fees</h3>
            <p className="text-sm text-zinc-400">Transparent pricing with no setup costs or hidden charges</p>
          </div>
          <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur">
            <h3 className="text-lg font-semibold text-white mb-2">Cancel Anytime</h3>
            <p className="text-sm text-zinc-400">Flexible subscription with no long-term commitments</p>
          </div>
          <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur">
            <h3 className="text-lg font-semibold text-white mb-2">14-Day Free Trial</h3>
            <p className="text-sm text-zinc-400">Try all features risk-free with our money-back guarantee</p>
          </div>
        </div>
        
        <div className="mt-8 text-sm text-zinc-500">
          <p>All prices are in INR and include applicable taxes. Billing is monthly.</p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;


