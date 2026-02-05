"use client";

import { cn } from "@utils/cn";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

interface NavIconProps {
  icon: LucideIcon;
  label: string;
  href: string;
  isActive: boolean;
  activeColor?: "primary" | "accent";
  shimmer?: boolean;
}

export function NavIcon({ icon: Icon, label, href, isActive, activeColor = "primary", shimmer = false }: NavIconProps) {
  const colorClasses = {
    primary: {
      active: "text-primary-400",
      glow: "bg-primary-500",
    },
    accent: {
      active: "text-accent-400",
      glow: "bg-accent-500",
    },
  };

  return (
    <Link href={href} prefetch aria-label={label} aria-current={isActive ? "page" : undefined}>
      <motion.div
        className={cn(
          "relative cursor-pointer rounded-lg p-3 transition-all duration-300",
          isActive ? colorClasses[activeColor].active : "text-fg/40 hover:bg-fg/5 hover:text-fg/70"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isActive && (
          <motion.div
            className={cn("absolute inset-0 rounded-lg opacity-20 blur-lg", colorClasses[activeColor].glow)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.2, scale: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}

        <div className="relative">
          {shimmer && isActive ? (
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
              <Icon className="relative z-10 h-5 w-5" />
            </motion.div>
          ) : (
            <Icon className="relative z-10 h-5 w-5" />
          )}
        </div>
      </motion.div>
    </Link>
  );
}
