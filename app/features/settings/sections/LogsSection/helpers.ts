import { REFRESH_INTERVAL_VALUES } from "./constants";
import type { LogEntry } from "./types";

export function isRefreshOption(raw: string): boolean {
  return REFRESH_INTERVAL_VALUES.some((value) => value === raw);
}

export function filterEntries(entries: LogEntry[], activeLevels: ReadonlySet<string>, search: string): LogEntry[] {
  const needle = search.trim().toLowerCase();
  return entries.filter((entry) => {
    const levelOk = entry.level === null || activeLevels.has(entry.level);
    const searchOk = needle === "" || entry.raw.toLowerCase().includes(needle);
    return levelOk && searchOk;
  });
}

export function entriesToText(entries: LogEntry[]): string {
  return entries.map((entry) => entry.raw).join("\n");
}
