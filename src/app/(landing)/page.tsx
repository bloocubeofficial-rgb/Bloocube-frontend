"use client";
import React from "react";
import Hero from "./components/Hero";
import Persona from "./components/Persona";
import Features from "./components/Features";
import Automation from "./components/Automation";
import Visualization from "./components/Visualization";
import Testimonials from "./components/Testimonials";
import Pricing from "./components/Pricing";
import Teams from "./components/Teams";

export default function LandingPage() {
  return (
    <>
      <div className="vis-lazy">
        <Hero />
      </div>
      <div className="vis-lazy">
        <Teams />
      </div>
      <div className="vis-lazy">
        <Persona />
      </div>
      <div className="vis-lazy">
        <Features />
      </div>
      <div className="vis-lazy">
        <Automation />
      </div>
      <div className="vis-lazy">
        <Visualization />
      </div>
      <div className="vis-lazy">
        <Testimonials />
      </div>
      <div className="vis-lazy">
        <Pricing />
      </div>
    </>
  );
}
