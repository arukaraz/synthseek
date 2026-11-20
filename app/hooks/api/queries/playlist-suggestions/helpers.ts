import { NOTHING_GONE, SUGGESTION_GONE_KEY, SUGGESTION_SEED_SPAN } from "./constants";
import type { PlaylistSuggestionsKey, SuggestionGoneKey, SuggestionPage, SuggestionReading } from "./types";

export function newSuggestionSeed(random: () => number = Math.random): number {
  return Math.min(SUGGESTION_SEED_SPAN - 1, Math.floor(random() * SUGGESTION_SEED_SPAN));
}

export function suggestionGoneKey({ playlistId, seed }: PlaylistSuggestionsKey): SuggestionGoneKey {
  return [SUGGESTION_GONE_KEY, playlistId, seed];
}

export function withGone(gone: readonly string[] | undefined, externalId: string): readonly string[] {
  const current = gone ?? [];
  return current.includes(externalId) ? current : [...current, externalId];
}

export function withoutGone(gone: readonly string[] | undefined, externalId: string): readonly string[] {
  return (gone ?? []).filter((id) => id !== externalId);
}

export function readSuggestionPages<Track extends { externalId: string }>(
  pages: readonly SuggestionPage<Track>[],
  barrenLimit: number,
  gone: ReadonlySet<string> = NOTHING_GONE
): SuggestionReading<Track> {
  const seen = new Set<string>();
  const rows: Track[] = [];
  let barren = 0;
  let wide = false;
  for (const page of pages) {
    const pageIsWide = page.widerCursor === null;
    if (pageIsWide !== wide) {
      wide = pageIsWide;
      barren = 0;
    }
    let brought = 0;
    for (const track of page.tracks) {
      if (seen.has(track.externalId)) continue;
      seen.add(track.externalId);
      brought += 1;
      if (!gone.has(track.externalId)) rows.push(track);
    }
    barren = brought === 0 ? barren + 1 : 0;
  }
  const last = pages.at(-1);
  if (last === undefined) return { rows, nextCursor: null };
  if (barren < barrenLimit) return { rows, nextCursor: last.nextCursor };
  return { rows, nextCursor: wide ? null : last.widerCursor };
}
