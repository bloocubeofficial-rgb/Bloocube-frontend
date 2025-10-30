"use client";
import React from "react";

const Teams = () => {
  const companies = [
    "Acme Co.",
    "Vertex Labs",
    "Northstar",
    "Everline",
    "Acme Co.",
    "Vertex Labs",
    "Northstar",
    "Everline",
  ];

  return (
    <section className="py-12 overflow-hidden mb-18 sm:mb-12">
      <div className="relative flex overflow-hidden">
        {/* The long scrolling track */}
        <div className="flex animate-marquee whitespace-nowrap will-change-transform">
          {[...companies, ...companies].map((company, index) => (
            <div key={index} className="mx-12 flex-shrink-0">
              <span className="text-2xl font-semibold text-muted-foreground  transition-colors">
                {company}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Teams;
