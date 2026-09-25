import i18n from "@locale";
import type { PlaybackServerKey } from "@utils/playback-servers";

import type { Affix } from "./types";

export function movedServer(order: readonly PlaybackServerKey[], index: number, offset: -1 | 1): PlaybackServerKey[] {
  const target = index + offset;
  if (target < 0 || target >= order.length) return [...order];
  const next = [...order];
  const [moved] = next.splice(index, 1);
  next.splice(target, 0, moved);
  return next;
}

export function previewName(affix: Affix, separator: string, username: string): string {
  const base = i18n.t("settings:plex.previewSampleName");
  if (affix === "off" || !username) return base;
  if (affix === "prefix") return `${username}${separator}${base}`;
  return `${base}${separator}${username}`;
}

export function buildRedirectUri(publicBaseUrl: string): string {
  if (!publicBaseUrl) return "";
  return `${publicBaseUrl.replace(/\/$/, "")}/api/auth/spotify/callback`;
}
