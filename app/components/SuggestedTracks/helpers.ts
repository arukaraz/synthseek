import { SUGGESTED_SEED_SPAN } from "./constants";
import type { SuggestedTrack } from "./types";

export function newSuggestionSeed(random: () => number = Math.random): number {
  return Math.min(SUGGESTED_SEED_SPAN - 1, Math.floor(random() * SUGGESTED_SEED_SPAN));
}

export function libraryCopyId(track: SuggestedTrack): string | null {
  return track.inLibrary ? track.requestId : null;
}

export function visibleSuggestions(
  tracks: readonly SuggestedTrack[],
  hidden: ReadonlySet<string>,
  shown: number
): { rows: SuggestedTrack[]; more: boolean; total: number } {
  const kept = tracks.filter((track) => !hidden.has(track.externalId));
  return { rows: kept.slice(0, shown), more: kept.length > shown, total: kept.length };
}

export function coverInitials(title: string): string {
  return title.trim().slice(0, 2).toUpperCase();
}
