import type { LucideIcon } from "lucide-react";

export interface NavIconProps {
  icon: LucideIcon;
  label: string;
  href: string;
  isActive: boolean;
  activeColor?: "primary" | "accent";
  shimmer?: boolean;
}
