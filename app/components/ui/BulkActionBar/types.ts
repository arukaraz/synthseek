import type { LucideIcon } from "lucide-react";
import type { ReactNode, Ref } from "react";

export type BulkActionBarAppearance = "compact" | "prominent";

export interface BulkAction {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  count?: number;
  disabled?: boolean;
  tone?: "default" | "danger";
}

export interface BulkActionBarProps {
  count: number;
  countLabel: string;
  actions: BulkAction[];
  clearLabel: string;
  onClear: () => void;
  appearance?: BulkActionBarAppearance;
  trailing?: ReactNode;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}
