import React from "react";
import Hero from "./components/Hero";
import TrustedBrands from "./components/TrustedBrands";
import ExploreCreators from "./components/ExploreCreators";
import HowItWorks from "./components/HowItWorks";
import ValueProps from "./components/ValueProps";
import FinalCTA from "./components/FinalCTA";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <TrustedBrands />
      <ExploreCreators />
      <HowItWorks />
      <ValueProps />
      <FinalCTA />
    </>
  );
}
