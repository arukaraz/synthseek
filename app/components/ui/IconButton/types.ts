import type { HTMLMotionProps } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import type { Ref } from "react";

export interface IconButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  icon: LucideIcon;
  variant?: "secondary" | "red" | "green" | "primary" | "accent" | "default";
  size?: "sm" | "md";
  animated?: boolean;
  "aria-label": string;
  ref?: Ref<HTMLButtonElement>;
}
