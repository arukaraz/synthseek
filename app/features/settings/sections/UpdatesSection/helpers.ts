import { calendarDateOf } from "@utils/formatters";

import type { EntryVariant } from "./types";

function parseSemverParts(version: string): number[] {
  return version.split(".").map((part) => {
    const parsed = Number.parseInt(part, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  });
}

export function compareSemver(a: string, b: string): number {
  const left = parseSemverParts(a);
  const right = parseSemverParts(b);
  for (let i = 0; i < 3; i += 1) {
    const da = left[i] ?? 0;
    const db = right[i] ?? 0;
    if (da !== db) {
      return da > db ? 1 : -1;
    }
  }
  return 0;
}

export function entryVariant(version: string, currentVersion: string | null, isNewest: boolean): EntryVariant {
  if (currentVersion && version === currentVersion) {
    return "current";
  }
  if (currentVersion && compareSemver(version, currentVersion) > 0) {
    return isNewest ? "latest" : "new";
  }
  if (!currentVersion && isNewest) {
    return "latest";
  }
  return "past";
}

export function formatEntryDate(dateString: string, locale: string): string {
  const date = calendarDateOf(dateString);
  if (date === null) {
    return dateString;
  }
  return date.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
}
