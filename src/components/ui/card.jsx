import React from "react";
import { cn } from "@/lib/utils";

export function Card({ children, className }) {
  return <div className={cn("surface-panel", className)}>{children}</div>;
}

export function CardContent({ children, className }) {
  return <div className={cn("p-6", className)}>{children}</div>;
}

