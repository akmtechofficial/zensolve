import React from "react";
import { cn } from "../../utils/cn";
import { FaSpinner } from "react-icons/fa";

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  className,
  loading = false,
  disabled = false,
  icon,
  iconPosition = "left",
  onClick,
  type = "button",
  ...props
}) => {
  const variants = {
    primary:
      "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 border border-indigo-400/30 active:scale-[0.98]",
    glow:
      "relative group bg-slate-900 text-white border border-indigo-500/40 hover:border-indigo-400 shadow-glow-sm hover:shadow-glow-md overflow-hidden",
    secondary:
      "bg-slate-800 hover:bg-slate-750 text-slate-100 border border-slate-700/80 hover:border-slate-600 active:scale-[0.98]",
    outline:
      "bg-transparent hover:bg-slate-800/60 text-slate-200 border border-slate-700 hover:border-slate-500 active:scale-[0.98]",
    ghost:
      "bg-transparent hover:bg-slate-800/50 text-slate-300 hover:text-white active:scale-[0.98]",
    emerald:
      "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 border border-emerald-400/30 active:scale-[0.98]",
    danger:
      "bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 active:scale-[0.98]",
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5 rounded-lg gap-1.5 font-medium",
    md: "text-sm px-4 py-2.5 rounded-xl gap-2 font-medium",
    lg: "text-base px-6 py-3 rounded-xl gap-2.5 font-semibold",
    xl: "text-base px-7 py-3.5 rounded-2xl gap-3 font-semibold",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-50 disabled:pointer-events-none select-none",
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className
      )}
      {...props}
    >
      {loading ? (
        <FaSpinner className="animate-spin text-current" />
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <span className="flex-shrink-0">{icon}</span>
          )}
          <span>{children}</span>
          {icon && iconPosition === "right" && (
            <span className="flex-shrink-0">{icon}</span>
          )}
        </>
      )}
    </button>
  );
};
