import type { LucideIcon } from "lucide-react";

export interface HeaderTabProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  badge?: number;
}
