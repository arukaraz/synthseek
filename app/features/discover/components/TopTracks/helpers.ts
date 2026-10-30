import type { ParseKeys } from "i18next";

import type { LastfmTopTrack } from "@features/discovery-integrations/types";
import type { BoardSize } from "@hooks/api/queries/board/types";

import { COMPACT_ROW_LIMIT } from "../constants";
import { HERO_LIMIT, LIST_LIMIT } from "./constants";
import type { EmptyReason, TopTracksSplit } from "./types";

export function topTracksSplit(tracks: readonly LastfmTopTrack[], size: BoardSize): TopTracksSplit {
  if (size === "S") return { hero: null, rest: tracks.slice(0, COMPACT_ROW_LIMIT), startRank: 1 };
  return {
    hero: tracks[0] ?? null,
    rest: tracks.slice(HERO_LIMIT, HERO_LIMIT + LIST_LIMIT),
    startRank: HERO_LIMIT + 1,
  };
}

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
