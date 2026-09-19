import { matchesTerms, searchTerms } from "@utils/search";

export function matchingRecycled<T extends { relativePath: string }>(
  entries: readonly T[] | undefined,
  search: string
): readonly T[] | undefined {
  const terms = searchTerms(search);
  if (entries === undefined || terms.length === 0) return entries;
  return entries.filter((entry) => matchesTerms(terms, [entry.relativePath]));
}

export function truncateMiddle(value: string, max: number): string {
  if (value.length <= max) return value;
  const tail = Math.floor((max - 1) / 2);
  const head = max - 1 - tail;
  return `${value.slice(0, head)}…${value.slice(value.length - tail)}`;
}
