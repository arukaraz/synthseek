import type { LucideIcon } from "lucide-react";
import type { ReactNode, Ref } from "react";

export interface BulkAction {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  count?: number;
  disabled?: boolean;
}

export interface ProminentBulkAction {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: "default" | "danger";
}

interface BulkActionBarBase {
  count: number;
  countLabel: string;
  clearLabel: string;
  onClear: () => void;
  trailing?: ReactNode;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

export interface CompactBulkActionBarProps extends BulkActionBarBase {
  appearance?: "compact";
  actions: BulkAction[];
}

export interface ProminentBulkActionBarProps extends BulkActionBarBase {
  appearance: "prominent";
  actions: ProminentBulkAction[];
}

export type BulkActionBarProps = CompactBulkActionBarProps | ProminentBulkActionBarProps;
