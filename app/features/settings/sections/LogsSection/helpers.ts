import { matchesTerms, searchTerms } from "@utils/search";

import { REFRESH_INTERVAL_VALUES } from "./constants";
import type { LogEntry } from "./types";

export function isRefreshOption(raw: string): boolean {
  return REFRESH_INTERVAL_VALUES.some((value) => value === raw);
}

export function filterEntries(entries: LogEntry[], activeLevels: ReadonlySet<string>, search: string): LogEntry[] {
  const terms = searchTerms(search);
  return entries.filter((entry) => {
    const levelOk = entry.level === null || activeLevels.has(entry.level);
    return levelOk && matchesTerms(terms, [entry.raw]);
  });
}

export function entriesToText(entries: LogEntry[]): string {
  return entries.map((entry) => entry.raw).join("\n");
}
