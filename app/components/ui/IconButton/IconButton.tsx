"use client";

import { motion } from "framer-motion";
import { NameTip } from "@components/ui/NameTip";
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

  const name = props["aria-label"];

  if (!animated) {
    return (
      <NameTip label={name}>
        <button
          ref={ref}
          data-part="button"
          data-icon-button
          className={buttonClasses}
          {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          <Icon className={iconSizes[size]} />
          <span data-icon-button-name>{name}</span>
        </button>
      </NameTip>
    );
  }

  return (
    <NameTip label={name}>
      <motion.button
        ref={ref}
        data-part="button"
        data-icon-button
        className={buttonClasses}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        {...props}
      >
        <Icon className={iconSizes[size]} />
        <span data-icon-button-name>{name}</span>
      </motion.button>
    </NameTip>
  );
}
