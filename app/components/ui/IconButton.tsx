"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@utils/cn";

interface IconButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  icon: LucideIcon;
  variant?: "secondary" | "red" | "green" | "primary" | "default";
  size?: "sm" | "md";
  animated?: boolean;
  "aria-label": string;
  ref?: React.Ref<HTMLButtonElement>;
}

const variantClasses = {
  secondary: "border-secondary-500/30 bg-secondary-500/10 text-secondary-400 hover:bg-secondary-500/20",
  red: "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20",
  green: "border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20",
  primary: "border-primary-500/30 bg-primary-500/10 text-primary-400 hover:bg-primary-500/20",
  default: "border-fg/10 bg-fg/5 text-fg/40 hover:bg-fg/10 hover:text-fg/70",
};

const sizeClasses = {
  sm: "rounded-md p-1",
  md: "rounded-lg p-1.5",
};

const iconSizes = {
  sm: "size-3",
  md: "size-3.5",
};

function IconButton({
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

export { IconButton };
export type { IconButtonProps };
