import React from "react";
import { cn } from "../../utils/cn";

export const BentoGrid = ({ className, children }) => {
  return (
    <div
      className={cn(
        "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-5 max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
  badge,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "row-span-1 rounded-2xl group/bento hover:shadow-2xl transition duration-300 p-6 glass-panel border border-slate-850 justify-between flex flex-col space-y-4 hover:border-indigo-500/40 hover:bg-slate-900/90 cursor-pointer relative overflow-hidden",
        className
      )}
    >
      {/* Subtle top border glow on hover */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/0 to-transparent group-hover/bento:via-indigo-500/60 transition-all duration-500" />

      {header}

      <div className="group-hover/bento:translate-x-1 transition duration-200">
        <div className="flex items-center justify-between mb-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover/bento:scale-110 group-hover/bento:bg-indigo-500/20 group-hover/bento:text-indigo-300 transition-all">
            {icon}
          </div>
          {badge && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60 group-hover/bento:border-indigo-500/30">
              {badge}
            </span>
          )}
        </div>

        <div className="font-semibold text-slate-100 text-lg mb-1 tracking-tight group-hover/bento:text-white">
          {title}
        </div>
        <div className="text-slate-400 text-sm font-normal leading-relaxed line-clamp-2">
          {description}
        </div>
      </div>
    </div>
  );
};
