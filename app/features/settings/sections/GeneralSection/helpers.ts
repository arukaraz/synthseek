import { formatRelativeTime, formatShortDate } from "@utils/formatters";

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

export function publicEndpoint(path: string, publicBaseUrl?: string): string {
  if (publicBaseUrl) return `${stripTrailingSlashes(publicBaseUrl)}${path}`;
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}
