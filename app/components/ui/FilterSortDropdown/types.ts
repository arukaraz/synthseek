import type { LucideIcon } from "lucide-react";

export interface FilterSortFilterOption<F extends string> {
  value: F;
  label: string;
  icon?: LucideIcon;
  count?: number;
}

export interface FilterSortSortOption<S extends string> {
  value: S;
  label: string;
}

export interface FilterSortDropdownProps<F extends string, S extends string> {
  filter: {
    value: F;
    onChange: (v: F) => void;
    options: ReadonlyArray<FilterSortFilterOption<F>>;
    sectionLabel?: string;
    sectionIcon?: LucideIcon;
  };
  sort: {
    value: S;
    onChange: (v: S) => void;
    options: ReadonlyArray<FilterSortSortOption<S>>;
    sectionLabel?: string;
    sectionIcon?: LucideIcon;
  };
  direction: {
    value: "asc" | "desc";
    onChange: (v: "asc" | "desc") => void;
  };
  triggerIcon?: LucideIcon;
  triggerClassName?: string;
  triggerLabel?: string;
  triggerLabelClassName?: string;
  align?: "start" | "end" | "center";
  dataCy?: string;
}
