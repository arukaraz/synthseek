"use client";

import { motion } from "framer-motion";
import { cn } from "@utils/cn";

interface ImageGlowProps {
  className?: string;
  opacity?: number;
}

export function ImageGlow({ className, opacity = 0.4 }: ImageGlowProps) {
  return (
    <motion.div
      className={cn("from-primary-500 to-accent-500 absolute -inset-1 rounded-xl bg-gradient-to-br blur-lg", className)}
      style={{ opacity }}
      animate={{
        opacity: [opacity - 0.1, opacity + 0.1, opacity - 0.1],
        scale: [0.95, 1.05, 0.95],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}
