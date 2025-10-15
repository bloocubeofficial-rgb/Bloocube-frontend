"use client";
import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

type Testimonial = {
  name: string;
  role: string;
  company: string;
  content: string;
  avatar: string;
};

const testimonials: Testimonial[] = [
  {
    name: "Sarah Chen",
    role: "Marketing Director",
    company: "TechCorp",
    content: "This platform transformed our social media strategy completely.",
    avatar: "SC",
  },
  {
    name: "Mike Johnson",
    role: "Content Creator",
    company: "CreativeStudio",
    content: "The analytics insights helped us grow our audience by 300%.",
    avatar: "MJ",
  },
  {
    name: "Lisa Rodriguez",
    role: "Social Media Manager",
    company: "BrandForce",
    content: "Scheduling content has never been this intuitive and powerful.",
    avatar: "LR",
  },
];

const Testimonials: React.FC = () => {
  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 mt-8">
      <div className="text-center mb-12">
        <h1 className="text-2xl md:text-5xl font-bold text-white">
          What Our <span className="text-gradient-primary">Leaders</span> Say
        </h1>
        <p className="text-sm md:text-xl mt-4 text-zinc-400 mt-2">
          Hear from industry pioneers who trust us to steer social media
          management, benefiting from our innovative solutions and dedicated
          support.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t, index) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="group relative rounded-2xl p-6 bg-white/[0.04] border border-white/10 backdrop-blur hover:border-white/20 hover:shadow-[0_0_30px_rgba(251,146,60,0.2)] hover:scale-[1.02] transition-all duration-300 cursor-pointer"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/10 via-amber-500/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full flex items-center justify-center text-xs font-bold mr-4 group-hover:scale-110 transition-transform duration-300">
                  {t.avatar}
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm group-hover:text-orange-300 transition-colors duration-300">
                    {t.name}
                  </h4>
                  <p className="text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300">
                    {t.role} at {t.company}
                  </p>
                </div>
              </div>
              <p className="text-zinc-300 text-sm group-hover:text-zinc-200 transition-colors duration-300">
                &ldquo;{t.content}&rdquo;
              </p>
              <div className="flex text-amber-400 mt-3 group-hover:text-amber-300 transition-colors duration-300">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 fill-current group-hover:scale-110 transition-transform duration-300"
                    style={{ transitionDelay: `${i * 50}ms` }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
