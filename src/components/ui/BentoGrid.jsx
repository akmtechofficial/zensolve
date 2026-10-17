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
        "row-span-1 rounded-3xl group/bento transition duration-300 p-6 glass-surface-2 glass-specular glass-card-interactive border border-slate-200/90 justify-between flex flex-col space-y-4 cursor-pointer relative overflow-hidden shadow-sm hover:shadow-md",
        className
      )}
    >

      {header}

      <div className="group-hover/bento:translate-x-1 transition duration-200">
        <div className="flex items-center justify-between mb-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover/bento:scale-110 group-hover/bento:bg-indigo-100 group-hover/bento:text-indigo-700 transition-all shadow-xs">
            {icon}
          </div>
          {badge && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 group-hover/bento:border-indigo-300">
              {badge}
            </span>
          )}
        </div>

        <div className="font-semibold text-slate-900 text-lg mb-1 tracking-tight group-hover/bento:text-indigo-600">
          {title}
        </div>
        <div className="text-slate-600 text-sm font-normal leading-relaxed line-clamp-2">
          {description}
        </div>
      </div>
    </div>
  );
};
