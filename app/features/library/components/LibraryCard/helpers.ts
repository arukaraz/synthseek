import type { RequestStatus } from "@api/__generated__/types";
import type { LibraryArtistItem, LibraryPlaylistItem } from "@hooks/api/queries/library/types";
import type { TFunction } from "i18next";
import { isProcessingStatus } from "@utils/status-helpers";
import { REQUEST_STATUS_CONFIG } from "@utils/statusConfig";
import type { MouseEvent, SyntheticEvent } from "react";

import type { CardCoverTone, CardSelection, StatusDotTone } from "./types";

export function cardCoverTone(selection: CardSelection | undefined): CardCoverTone {
  if (selection === undefined) return "none";
  if (selection.preview !== "none") return selection.preview;
  return selection.selected ? "selected" : "none";
}

export function artistSubtitle(item: LibraryArtistItem, albumsLabel: string): string {
  return item.genre ? `${albumsLabel} · ${item.genre}` : albumsLabel;
}

export function playlistSubtitle(item: LibraryPlaylistItem, origin: string, t: TFunction<"library">): string {
  const described = item.smart ? t("playlists.smartOrigin", { origin }) : origin;
  return item.visibility === "private" ? t("playlists.privateOrigin", { origin: described }) : described;
}

export function joinMeta(parts: readonly (string | number | null | undefined)[]): string {
  return parts.filter((part) => part !== null && part !== undefined && part !== "").join(" · ");
}

function isOwnEvent(event: SyntheticEvent<HTMLElement>): boolean {
  return event.target instanceof Node && event.currentTarget.contains(event.target);
}

export function onOwnClick(
  handler: (event: MouseEvent<HTMLElement>) => void
): (event: MouseEvent<HTMLElement>) => void {
  return (event) => {
    if (isOwnEvent(event)) handler(event);
  };
}

export function shieldOwnClick(event: MouseEvent<HTMLElement>): void {
  if (isOwnEvent(event)) event.stopPropagation();
}

export function cardInitials(name: string): string {
  const words = name
    .trim()
    .split(" ")
    .filter((word) => word.length > 0);
  if (words.length === 0) return "?";
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return words[0].slice(0, 2).toUpperCase();
}

export function statusDotClass(status: RequestStatus): string {
  return REQUEST_STATUS_CONFIG[status].glowColor;
}

export function statusDotTone(status: RequestStatus): StatusDotTone {
  if (status === "complete" || status === "partially_complete") return "complete";
  if (status === "failed" || status === "cancelled") return "failed";
  return isProcessingStatus(status) ? "active" : "idle";
}

export function albumMetaLine(
  year: number | null,
  quality: string | null,
  pathLabels: readonly string[]
): string | null {
  const parts: string[] = [];
  if (year !== null) parts.push(String(year));
  if (quality) parts.push(quality);
  parts.push(...pathLabels);
  if (parts.length === 0) return null;
  return parts.join(" · ");
}

export function mosaicTiles(images: string[], image: string | null): string[] {
  if (image) return [image];
  if (images.length > 0) return images.slice(0, 4);
  return [];
}
