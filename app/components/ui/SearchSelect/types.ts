import type { SelectMenuOption } from "@components/ui/SelectMenu";

export interface SearchSelectProps<T extends string | number> {
  value: T | null | undefined;
  options: ReadonlyArray<SelectMenuOption<T>>;
  onChange: (next: T) => void;
  ariaLabel: string;
  searchPlaceholder: string;
  emptyText: string;
  placeholder?: string;
  disabled?: boolean;
}
