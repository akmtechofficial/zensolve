import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

export const Tabs = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div
      className={cn(
        "flex items-center p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md overflow-x-auto",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2",
              isActive ? "text-white" : "text-slate-400 hover:text-slate-200"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="active-tab-pill"
                className="absolute inset-0 bg-indigo-600 rounded-xl shadow-md shadow-indigo-500/20"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-semibold",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-800 text-slate-400"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};
