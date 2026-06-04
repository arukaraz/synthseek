import i18n from "@locale";

import type { Affix } from "./types";

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
