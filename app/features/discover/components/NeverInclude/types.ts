import type { SearchComboboxOption } from "@components/ui/SearchCombobox";

export interface VetoListProps {
  label: string;
  placeholder: string;
  entries: readonly { value: string; label: string }[];
  options: readonly SearchComboboxOption[];
  query: string;
  onQueryChange: (query: string) => void;
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
}
