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

export function withoutPriority<T extends { priority: number }>(source: T): Omit<T, "priority"> {
  const { priority: _priority, ...rest } = source;
  return rest;
}

export function sameOrder<K extends string>(left: readonly K[], right: readonly K[]): boolean {
  return left.length === right.length && left.every((key, index) => key === right[index]);
}
