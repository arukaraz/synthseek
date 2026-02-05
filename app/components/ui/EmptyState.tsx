"use client";

import { cn } from "@utils/cn";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, className }: EmptyStateProps) {
  return (
    <motion.div
      className={cn("flex h-full flex-col items-center justify-center p-8 text-center", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="bg-fg/5 mb-4 rounded-full p-6">
        <Icon className="text-fg/30 h-12 w-12" />
      </div>
      <h3 className="text-fg/80 mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-fg/50 max-w-xs text-sm">{description}</p>
    </motion.div>
  );
}
