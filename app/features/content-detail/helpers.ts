import i18n from "@locale";
import { formatDate } from "@utils/formatters";
import type { CSSProperties } from "react";

import type { DetailTarget, FactItem } from "./types";

export function formatBorn(bornDate: string | null, bornPlace: string | null): string | null {
  if (!bornDate) return null;
  const date = formatDate(new Date(bornDate));
  return bornPlace ? `${date} · ${bornPlace}` : date;
}

export function cardRingFillStyle(libraryTrackCount: number, totalTracks: number): CSSProperties {
  const ratio = totalTracks > 0 ? Math.min(1, libraryTrackCount / totalTracks) : 0;
  return { "--dock-ring-fill": `${Math.round(ratio * 360)}deg` } as CSSProperties;
}

export function detailInitials(name: string): string {
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

export function formatStat(value: number | null): string {
  if (value === null) return "-";
  if (value < 10000) return value.toLocaleString(i18n.language);
  return new Intl.NumberFormat(i18n.language, { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function visibleFacts(facts: FactItem[]): FactItem[] {
  return facts.filter((fact) => {
    if (fact.items) return fact.items.length > 0;
    return fact.value !== null && fact.value.trim().length > 0;
  });
}

export function albumTarget(args: {
  id: string;
  name: string;
  artistName: string;
  cover: string | null;
}): DetailTarget {
  return {
    mode: "album",
    id: args.id,
    name: args.name,
    artistName: args.artistName,
    cover: args.cover,
  };
}

export function artistTarget(args: { id: string; name: string; cover: string | null }): DetailTarget {
  return {
    mode: "artist",
    id: args.id,
    name: args.name,
    artistName: args.name,
    cover: args.cover,
  };
}
