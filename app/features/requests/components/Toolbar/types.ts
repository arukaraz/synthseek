import type { LucideIcon } from "lucide-react";
import type { StatusFilter } from "../../types";

export interface OrderToggleProps {
  isActive: boolean;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}

export interface StatusFilterIcon {
  value: StatusFilter;
  icon: LucideIcon;
}

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface RequestsToolbarMenuProps {
  hasItems: boolean;
}
