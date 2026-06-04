import type { ParseKeys } from "i18next";

import type { EmptyReason } from "./types";

export function formatPlaycount(n: number): string {
  if (n < 1000) return n.toString();
  if (n < 10_000) return (n / 1000).toFixed(1) + "k";
  return Math.round(n / 1000) + "k";
}

const EMPTY_TEXT_KEYS: Record<EmptyReason, ParseKeys<"discover">> = {
  error: "topTracks.empty.error",
  disabled: "topTracks.empty.disabled",
  "no-username": "topTracks.empty.noUsername",
  "no-data": "topTracks.empty.noData",
};

export function emptyTextKey(reason: EmptyReason): ParseKeys<"discover"> {
  return EMPTY_TEXT_KEYS[reason];
}
