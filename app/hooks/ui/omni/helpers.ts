import { z } from "zod";

import { RECENT_SEARCH_MAX_LENGTH, RECENT_SEARCHES_LIMIT } from "./constants";
import type { StepDelta } from "./types";

const RecentSearchesSchema = z.array(z.string().min(1).max(RECENT_SEARCH_MAX_LENGTH)).max(RECENT_SEARCHES_LIMIT);

export function parseRecentSearches(raw: string): string[] | null {
  try {
    const parsed = RecentSearchesSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function isRecentSearches(raw: string): boolean {
  return parseRecentSearches(raw) !== null;
}

export function withRecentSearch(recent: readonly string[], query: string): string[] {
  const folded = query.toLocaleLowerCase();
  return [query, ...recent.filter((entry) => entry.toLocaleLowerCase() !== folded)].slice(0, RECENT_SEARCHES_LIMIT);
}

export function cycleScope<TScope extends string>(
  scopes: readonly TScope[],
  current: TScope,
  delta: StepDelta
): TScope {
  const index = scopes.indexOf(current);
  return scopes[(index + delta + scopes.length) % scopes.length] ?? current;
}

export function stepHighlight(current: number, count: number, delta: StepDelta): number {
  if (count === 0) return -1;
  if (current < 0) return delta === 1 ? 0 : count - 1;
  return (current + delta + count) % count;
}

export function isSearchShortcut(event: Pick<KeyboardEvent, "key" | "metaKey" | "ctrlKey">): boolean {
  return (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
}

export function isApplePlatform(platform: string): boolean {
  const name = platform.toLowerCase();
  return name.includes("mac") || name.includes("iphone") || name.includes("ipad");
}
