import type { ReactNode } from "react";

export interface SelectMenuOption<T extends string | number> {
  value: T;
  label: string;
  description?: string;
}

export interface SelectMenuProps<T extends string | number> {
  adornment?: ReactNode;
  value: T | null | undefined;
  options: ReadonlyArray<SelectMenuOption<T>>;
  onChange: (next: T) => void;
  ariaLabel: string;
  placeholder?: string;
  disabled?: boolean;
  size?: "md" | "lg";
}
