"use client";

import { motion } from "framer-motion";
import { cn } from "@utils/cn";
import { iconSizes, sizeClasses, variantClasses } from "./styles";
import type { IconButtonProps } from "./types";

export function IconButton({
  icon: Icon,
  variant = "default",
  size = "md",
  animated = true,
  className,
  ref,
  ...props
}: IconButtonProps) {
  const buttonClasses = cn(
    "cursor-pointer border transition-colors disabled:cursor-not-allowed disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  if (!animated) {
    return (
      <button ref={ref} className={buttonClasses} {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
        <Icon className={iconSizes[size]} />
      </button>
    );
  }

  return (
    <motion.button
      ref={ref}
      className={buttonClasses}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      <Icon className={iconSizes[size]} />
    </motion.button>
  );
}
