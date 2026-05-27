import type { SidebarBadgeInfo } from "./types";

export function spotifyBadge(connected: boolean, pending: boolean): SidebarBadgeInfo {
  if (connected) return { label: "On", tone: "success" };
  if (pending) return { label: "Pending", tone: "warning" };
  return { label: "Off", tone: "neutral" };
}
