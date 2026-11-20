import type { TFunction } from "i18next";

import type { KnownYears, SuggestedTrack, SuggestedYears, YearSpan, YearThumbs } from "./types";

export function libraryCopyId(track: SuggestedTrack): string | null {
  return track.inLibrary ? track.requestId : null;
}

export function coverInitials(title: string): string {
  return title.trim().slice(0, 2).toUpperCase();
}

export function yearSpan(floor: number, now: Date = new Date()): YearSpan {
  return { floor, ceiling: Math.max(floor, now.getFullYear()) };
}

export function filtersYears(years: SuggestedYears): boolean {
  return years.from !== null || years.to !== null;
}

export function sameYears(first: SuggestedYears, second: SuggestedYears): boolean {
  return first.from === second.from && first.to === second.to;
}

export function knowsYears(known: KnownYears | null, playlistId: string, years: SuggestedYears): boolean {
  return known !== null && known.playlistId === playlistId && sameYears(known.years, years);
}

export function yearsInForce(
  loaded: SuggestedYears | undefined,
  known: KnownYears | null,
  playlistId: string,
  fallback: SuggestedYears
): SuggestedYears {
  if (loaded !== undefined) return loaded;
  return known !== null && known.playlistId === playlistId ? known.years : fallback;
}

export function thumbsFor(years: SuggestedYears, span: YearSpan): YearThumbs {
  const low = Math.min(span.ceiling, Math.max(span.floor, years.from ?? span.floor));
  const high = Math.min(span.ceiling, Math.max(low, years.to ?? span.ceiling));
  return { low, high };
}

export function yearsAt(thumbs: YearThumbs, span: YearSpan): SuggestedYears {
  return {
    from: thumbs.low <= span.floor ? null : thumbs.low,
    to: thumbs.high >= span.ceiling ? null : thumbs.high,
  };
}

export function yearsLabel(years: SuggestedYears, t: TFunction<"components">): string {
  if (years.from !== null && years.to !== null) {
    return years.from === years.to
      ? String(years.from)
      : t("suggestedTracks.years.between", { from: years.from, to: years.to });
  }
  if (years.from !== null) return t("suggestedTracks.years.from", { from: years.from });
  if (years.to !== null) return t("suggestedTracks.years.to", { to: years.to });
  return t("suggestedTracks.years.any");
}
