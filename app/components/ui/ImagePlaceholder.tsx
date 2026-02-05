"use client";

import { type LucideIcon, Music } from "lucide-react";
import { cn } from "@utils/cn";

interface ImagePlaceholderProps {
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  className?: string;
}

const sizeClasses = {
  sm: "h-10 w-10",
  md: "h-14 w-14",
  lg: "h-16 w-16",
};

const iconSizes = {
  sm: "h-5 w-5",
  md: "h-7 w-7",
  lg: "h-8 w-8",
};

export function ImagePlaceholder({ size = "md", icon: Icon = Music, className }: ImagePlaceholderProps) {
  return (
    <div
      className={cn(
        "from-primary-500/20 to-accent-500/20 ring-fg/10 relative flex items-center justify-center rounded-lg bg-gradient-to-br ring-1",
        sizeClasses[size],
        className
      )}
    >
      <Icon className={cn("text-primary-400", iconSizes[size])} />
    </div>
  );
}
