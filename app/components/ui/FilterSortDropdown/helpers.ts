export function selectedValue<T extends string>(options: ReadonlyArray<{ value: T }>, value: string): T | null {
  return options.find((option) => option.value === value)?.value ?? null;
}
