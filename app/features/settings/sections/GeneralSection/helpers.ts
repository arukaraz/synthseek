import { formatRelativeTime, formatTimestamp } from "@utils/formatters";

export function formatLastUsed(date: Date | null): string {
  return date ? `last used ${formatRelativeTime(date)}` : "never used";
}

export function formatCreated(date: Date): string {
  return `created ${formatTimestamp(date)}`;
}

function stripTrailingSlashes(url: string): string {
  let result = url;
  while (result.endsWith("/")) result = result.slice(0, -1);
  return result;
}

/**
 * Resolves the MCP endpoint shown to the user. Prefers the admin-configured
 * public base URL (the address the instance is reached at); falls back to the
 * browser origin so it still works before any public URL is configured.
 */
export function mcpEndpoint(publicBaseUrl?: string): string {
  if (publicBaseUrl) return `${stripTrailingSlashes(publicBaseUrl)}/api/v1/mcp`;
  if (typeof window === "undefined") return "/api/v1/mcp";
  return `${window.location.origin}/api/v1/mcp`;
}
