import type { ArtistSuggestion } from "./types";

export function suggestionIds(items: readonly ArtistSuggestion[]): string[] {
  return items.map((item) => item.artist.id);
}

export function arrangeInSlots(slots: readonly string[], suggestions: readonly ArtistSuggestion[]): ArtistSuggestion[] {
  const byId = new Map(suggestions.map((item) => [item.artist.id, item]));
  const placed = new Set(slots);
  const arrivals = suggestions.filter((item) => !placed.has(item.artist.id));
  const arranged: ArtistSuggestion[] = [];
  let next = 0;
  for (const id of slots) {
    const kept = byId.get(id);
    const item = kept ?? arrivals[next];
    if (kept === undefined) next += 1;
    if (item !== undefined) arranged.push(item);
  }
  return [...arranged, ...arrivals.slice(next)];
}

export function sameOrder(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((id, index) => id === right[index]);
}
