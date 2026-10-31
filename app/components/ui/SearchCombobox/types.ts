export interface SearchComboboxOption {
  value: string;
  label: string;
  hint?: string;
}

export interface SearchComboboxProps {
  label: string;
  placeholder: string;
  options: readonly SearchComboboxOption[];
  query: string;
  onQueryChange: (query: string) => void;
  onPick: (option: SearchComboboxOption) => void;
  emptyText?: string;
  loading?: boolean;
}
