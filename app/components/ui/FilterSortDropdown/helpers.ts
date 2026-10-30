import type { FilterSortFilter, FilterSortFilterGroup } from "./types";

export function selectedValue<T extends string>(options: ReadonlyArray<{ value: T }>, value: string): T | null {
  return options.find((option) => option.value === value)?.value ?? null;
}

export function filterColumnsOf<F extends string>(
  filter: FilterSortFilter<F> | undefined,
  groups: ReadonlyArray<FilterSortFilterGroup>,
  fallbackLabel: string
): FilterSortFilterGroup[] {
  if (!filter) return [...groups];
  const column: FilterSortFilterGroup = {
    id: "filter",
    label: filter.sectionLabel ?? fallbackLabel,
    icon: filter.sectionIcon,
    value: filter.value,
    onChange: (value) => {
      const next = selectedValue(filter.options, value);
      if (next !== null) filter.onChange(next);
    },
    options: filter.options,
  };
  return [column, ...groups];
}
