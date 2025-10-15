// "use client";
// import React from "react";

// import Persona from "./components/Persona";
// import Features from "./components/Features";
// import Automation from "./components/Automation";
// import Visualization from "./components/Visualization";
// import Testimonials from "./components/Testimonials";
// import Pricing from "./components/Pricing";
// import Hero from "./components/Hero";
// import Teams from "./components/Teams";

// export default function LandingPage() {
//   return (
//     <>
//       <div className="vis-lazy">
//         <Hero />
//       </div>
//       <div className="vis-lazy">
//         <Teams />
//       </div>
//       <div className="vis-lazy">
//         <Persona />
//       </div>
//       <div className="vis-lazy">
//         <Features />
//       </div>
//       <div className="vis-lazy">
//         <Automation />
//       </div>
//       <div className="vis-lazy">
//         <Visualization />
//       </div>
//       <div className="vis-lazy">
//         <Testimonials />
//       </div>
//       <div className="vis-lazy">
//         <Pricing />
//       </div>
//     </>
//   );
// }

"use client";

import React from "react";
import dynamic from "next/dynamic";
import Hero from "./components/Hero";
import Teams from "./components/Teams";
// 🧠 Lazy load only heavy animation sections

const Persona = dynamic(() => import("./components/Persona"), { ssr: false });
const Features = dynamic(() => import("./components/Features"), { ssr: false });
const Automation = dynamic(() => import("./components/Automation"), {
  ssr: false,
});
const Visualization = dynamic(() => import("./components/Visualization"), {
  ssr: false,
});
const Testimonials = dynamic(() => import("./components/Testimonials"), {
  ssr: false,
});
const Pricing = dynamic(() => import("./components/Pricing"), { ssr: false });

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
