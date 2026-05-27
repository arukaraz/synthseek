"use client";

import { Music } from "lucide-react";
import { cn } from "@utils/cn";
import { iconSizes, sizeClasses } from "./styles";
import type { ImagePlaceholderProps } from "./types";

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
