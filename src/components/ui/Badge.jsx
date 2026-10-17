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
    default: "bg-slate-100 text-slate-700 border-slate-200",
    primary: "bg-indigo-50 text-indigo-700 border-indigo-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    verified: "bg-blue-50 text-blue-700 border-blue-200",
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
      icon={<FaCheckCircle className="text-blue-600 w-3 h-3" />}
      className={cn("font-medium", className)}
    >
      {text}
    </Badge>
  );
};
