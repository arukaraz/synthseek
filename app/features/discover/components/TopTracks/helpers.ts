import type { ParseKeys } from "i18next";

import type { ListenedTrack } from "@hooks/api/queries/analytics/types";

import type { WidgetItem } from "../CustomWidget/types";
import type { EmptyReason, EmptyReasonInput } from "./types";

export function formatPlaycount(n: number): string {
  if (n < 1000) return n.toString();
  if (n < 10_000) return (n / 1000).toFixed(1) + "k";
  return Math.round(n / 1000) + "k";
}

export function topTrackItem(track: ListenedTrack, plays: string | null): WidgetItem {
  return {
    key: track.id,
    title: track.title,
    subtitle: track.artist,
    cover: track.albumImage,
    value: plays,
    date: null,
    move: null,
    play: null,
    request: null,
    open: null,
    link: null,
  };
}

export function emptyReasonOf({ isError, data, empty }: EmptyReasonInput): EmptyReason | null {
  if (isError) return "error";
  if (!data) return null;
  if (data.status !== "ready") return data.status;
  return empty ? "no-data" : null;
}

const EMPTY_TEXT_KEYS: Record<EmptyReason, ParseKeys<"discover">> = {
  error: "topTracks.empty.error",
  inactive: "board.providerInactive",
  unlinked: "topTracks.empty.noUsername",
  "no-data": "topTracks.empty.noData",
};

export function emptyTextKey(reason: EmptyReason): ParseKeys<"discover"> {
  return EMPTY_TEXT_KEYS[reason];
}
