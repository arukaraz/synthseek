export function matchingRecycled<T extends { relativePath: string }>(
  entries: readonly T[] | undefined,
  search: string
): readonly T[] | undefined {
  const needle = search.trim().toLowerCase();
  if (entries === undefined || needle.length === 0) return entries;
  return entries.filter((entry) => entry.relativePath.toLowerCase().includes(needle));
}

export function truncateMiddle(value: string, max: number): string {
  if (value.length <= max) return value;
  const tail = Math.floor((max - 1) / 2);
  const head = max - 1 - tail;
  return `${value.slice(0, head)}…${value.slice(value.length - tail)}`;
}
