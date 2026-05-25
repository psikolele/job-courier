import React from "react";
import { AnimatedButton } from "./animated-button";

export default function DemoOne() {
  return (
    <div className="w-full h-screen flex items-center justify-center mx-auto relative bg-[#050b2b]">
      {/* Showcasing the interactive button */}
      <div className="z-10 flex flex-col items-center gap-6">
        <h2 className="text-white text-3xl font-bold tracking-tight font-sans text-center">
          Interactive Premium Button Demo
        </h2>
        <p className="text-slate-400 text-sm max-w-md text-center mb-4">
          Hover over the button below to see the modern glow effect track your mouse pointer dynamically.
        </p>
        
        <AnimatedButton
          href="https://uicat.vercel.app/"
          external={true}
          title="payment"
          className="relative inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-6 py-3 text-sm font-medium text-white backdrop-blur-md border border-white/20 hover:bg-white/20 hover:border-white/30"
        >
          Get Started UI CAT
        </AnimatedButton>
      </div>

      {/* Modern Dotted Grid Background */}
      <div
        className="absolute inset-0 w-full h-full -z-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg width=\\'16\\' height=\\'16\\' viewBox=\\'0 0 16 16\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Ccircle cx=\\'8\\' cy=\\'8\\' r=\\'1.5\\' fill=\\'%23a855f7\\' fill-opacity=\\'0.3\\' /%3E%3C/svg%3E')",
          backgroundColor: "transparent",
        }}
      />
    </div>
  );
}
