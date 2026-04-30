import type { LucideIcon } from "lucide-react";
import type { StatusFilter } from "../../types";

export interface OrderToggleProps {
  isActive: boolean;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}

export interface StatusFilterOption {
  value: StatusFilter;
  label: string;
  icon: LucideIcon;
}
