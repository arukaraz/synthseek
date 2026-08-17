import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface BulkAction {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  count?: number;
  disabled?: boolean;
}

export interface BulkActionBarProps {
  count: number;
  countLabel: string;
  actions: BulkAction[];
  clearLabel: string;
  onClear: () => void;
  trailing?: ReactNode;
  className?: string;
}
