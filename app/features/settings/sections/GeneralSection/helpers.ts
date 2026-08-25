import type { Theme } from "@theme/ThemeProvider";
import { formatRelativeTime, formatShortDate } from "@utils/formatters";

import { ROVING_KEYS, THEME_OPTIONS } from "./constants";
import type { RovingNavKey } from "./types";

export function isRovingKey(key: string): key is RovingNavKey {
  return ROVING_KEYS.some((rovingKey) => rovingKey === key);
}

export function isThemeValue(value: string | undefined): value is Theme {
  return THEME_OPTIONS.some((option) => option.value === value);
}

export function nextRovingIndex(current: number, count: number, key: RovingNavKey): number {
  switch (key) {
    case "ArrowRight":
    case "ArrowDown":
      return (current + 1) % count;
    case "ArrowLeft":
    case "ArrowUp":
      return (current - 1 + count) % count;
    case "Home":
      return 0;
    case "End":
      return count - 1;
  }
}

export function lastUsedTime(date: Date | null): string | null {
  return date ? formatRelativeTime(date) : null;
}

export function createdTime(date: Date): string {
  return formatShortDate(date);
}

function stripTrailingSlashes(url: string): string {
  let result = url;
  while (result.endsWith("/")) result = result.slice(0, -1);
  return result;
}

/**
 * Resolves an inbound endpoint shown to the user. Prefers the admin-configured
 * public base URL (the address the instance is reached at); falls back to the
 * browser origin so it still works before any public URL is configured. Every
 * inbound surface MUST derive its address here: a client pasted into a phone
 * outside the LAN needs the public address, not whichever origin the operator's
 * browser happens to be on.
 */
export function publicEndpoint(path: string, publicBaseUrl?: string): string {
  if (publicBaseUrl) return `${stripTrailingSlashes(publicBaseUrl)}${path}`;
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}
