import type { LucideIcon } from "lucide-react";
import type { StatusFilter } from "../../types";

export type ImportProviderState = "not_configured" | "not_connected" | "pending" | "ready";

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

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}
