"use client";

import { motion } from "framer-motion";
import { cn } from "@utils/cn";
import { sizeClasses } from "./styles";
import type { ProgressBarProps } from "./types";

export function ProgressBar({
  progress,
  isActive = false,
  gradient = "from-primary-500 to-accent-500",
  size = "md",
  className,
}: ProgressBarProps) {
  return (
    <div
      className={cn("border-fg/5 bg-surface/40 overflow-hidden rounded-full border", sizeClasses[size], className)}
      data-testid="progress-bar"
      data-progress={progress}
      data-loading={isActive}
    >
      <motion.div
        className={cn("relative h-full bg-gradient-to-r", gradient)}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {isActive && (
          <motion.div
            className="via-fg/20 absolute inset-0 bg-gradient-to-r from-transparent to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        )}
      </motion.div>
    </div>
  );
}
