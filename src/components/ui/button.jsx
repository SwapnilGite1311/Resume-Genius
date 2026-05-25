import React from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-blue-600 text-white shadow-[0_14px_30px_rgba(15,95,215,0.28)] hover:bg-blue-700",
  secondary:
    "bg-slate-950 text-slate-50 shadow-[0_14px_30px_rgba(2,8,23,0.24)] hover:bg-slate-800",
  outline:
    "border border-slate-200 bg-white/80 text-slate-900 hover:border-blue-300 hover:bg-blue-50",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100",
  danger:
    "bg-rose-600 text-white shadow-[0_14px_30px_rgba(225,29,72,0.22)] hover:bg-rose-700",
};

const sizes = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-sm",
};

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold transition duration-200 focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

