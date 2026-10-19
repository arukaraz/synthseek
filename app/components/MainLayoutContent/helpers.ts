import type { FilterType } from "@api/__generated__/types";

export function searchHref(query: string, scope: FilterType): string {
  const filter = scope === "all" ? "" : `&filter=${scope}`;
  return `/search?q=${encodeURIComponent(query)}${filter}`;
}
