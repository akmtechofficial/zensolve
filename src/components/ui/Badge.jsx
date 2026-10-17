import React from "react";
import { cn } from "../../utils/cn";
import { FaCheckCircle } from "react-icons/fa";

export const Badge = ({
  children,
  variant = "default",
  size = "md",
  className,
  icon,
}) => {
  const variants = {
    default: "bg-slate-800/80 text-slate-300 border-slate-700/60",
    primary: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
    success: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    danger: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    purple: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    verified: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  };

  const sizes = {
    sm: "text-[11px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3.5 py-1.5 gap-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border transition-colors",
        variants[variant] || variants.default,
        sizes[size] || sizes.md,
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

export const VerifiedBadge = ({ text = "Verified Company", className }) => {
  return (
    <Badge
      variant="verified"
      size="sm"
      icon={<FaCheckCircle className="text-blue-400 w-3 h-3" />}
      className={cn("font-medium", className)}
    >
      {text}
    </Badge>
  );
};
