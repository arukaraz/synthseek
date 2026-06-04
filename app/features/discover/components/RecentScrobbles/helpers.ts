import type { ParseKeys } from "i18next";

import i18n from "@locale";

import type { EmptyReason } from "./types";

const EMPTY_TEXT_KEYS: Record<EmptyReason, ParseKeys<"discover">> = {
  error: "recentScrobbles.empty.error",
  disabled: "recentScrobbles.empty.disabled",
  "no-username": "recentScrobbles.empty.noUsername",
  "no-data": "recentScrobbles.empty.noData",
};

export function emptyTextKey(reason: EmptyReason): ParseKeys<"discover"> {
  return EMPTY_TEXT_KEYS[reason];
}

export function describeScrobbleAge(playedAt: string | null | undefined, nowMs: number): string {
  if (!playedAt) return "";
  const diffMs = nowMs - new Date(playedAt).getTime();
  if (diffMs < 60_000) return i18n.t("discover:recentScrobbles.ageJustNow");
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return i18n.t("discover:recentScrobbles.ageMinutes", { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return i18n.t("discover:recentScrobbles.ageHours", { count: hours });
  const days = Math.floor(hours / 24);
  return i18n.t("discover:recentScrobbles.ageDays", { count: days });
}
