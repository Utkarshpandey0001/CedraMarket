"use client";
import React, { ReactNode } from "react";
import { motion } from "framer-motion";

export const AuroraBackground = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-slate-200 selection:bg-cyan-500 selection:text-white overflow-x-hidden">
      {/* Moving Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[40%] rounded-full bg-blue-900/20 blur-[120px] animate-pulse delay-1000" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[40%] rounded-full bg-indigo-900/20 blur-[120px] animate-pulse delay-2000" />
      </div>
      
      {/* Glass Overlay for content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};