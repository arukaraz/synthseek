export interface SelectMenuOption<T extends string | number> {
  value: T;
  label: string;
  description?: string;
}

export interface SelectMenuProps<T extends string | number> {
  value: T | null | undefined;
  options: ReadonlyArray<SelectMenuOption<T>>;
  onChange: (next: T) => void;
  ariaLabel: string;
  placeholder?: string;
  disabled?: boolean;
  size?: "md" | "lg";
}
