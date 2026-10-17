import React from "react";
import { cn } from "../../utils/cn";

export const BackgroundBeams = ({ className, children }) => {
  return (
    <div className={cn("relative w-full overflow-hidden", className)}>
      {/* Background Grid Pattern with Radial Fade */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 mask-radial-top pointer-events-none" />

      {/* Ambient gradient orbs */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-indigo-500/15 via-purple-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-1/3 -left-48 w-96 h-96 bg-brand-500/10 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-1/2 -right-48 w-96 h-96 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

      {/* Foreground Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
