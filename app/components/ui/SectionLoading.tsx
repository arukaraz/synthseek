"use client";

import { cn } from "@utils/cn";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface SectionLoadingProps {
  message?: string;
  className?: string;
}

export function SectionLoading({ message = "Loading...", className }: SectionLoadingProps) {
  return (
    <motion.div
      className={cn("flex h-full flex-col items-center justify-center p-8 text-center", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Loader2 className="text-primary-500 mb-4 h-8 w-8 animate-spin" />
      <p className="text-fg/50 text-sm">{message}</p>
    </motion.div>
  );
}
