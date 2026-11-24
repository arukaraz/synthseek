import type { ParseKeys } from "i18next";

import { SOURCE_NAMES } from "@components/SourceBadge";

import type { FigureEntry, FigureGroup, FigureKind, FigureSources } from "./types";

const FIGURE_LABEL_KEYS: Record<FigureKind, ParseKeys<"contentDetail">> = {
  listeners: "stats.listeners",
  plays: "stats.plays",
};

const FIGURE_BY_SOURCE_KEYS: Record<FigureKind, ParseKeys<"contentDetail">> = {
  listeners: "stats.bySource.listeners",
  plays: "stats.bySource.plays",
};

export function figureGroupsOf({ lastfm, listenbrainz, catalogFans }: FigureSources): FigureGroup[] {
  const listeners: FigureEntry[] = [];
  const plays: FigureEntry[] = [];
  if (lastfm && lastfm.listeners !== null) {
    listeners.push({ source: "lastfm", name: SOURCE_NAMES.lastfm, value: lastfm.listeners, fans: false });
  }
  if (catalogFans) {
    listeners.push({ source: "catalog", name: catalogFans.provider, value: catalogFans.fans, fans: true });
  }
  if (listenbrainz && listenbrainz.listeners !== null) {
    listeners.push({
      source: "listenbrainz",
      name: SOURCE_NAMES.listenbrainz,
      value: listenbrainz.listeners,
      fans: false,
    });
  }
  if (lastfm && lastfm.plays !== null) {
    plays.push({ source: "lastfm", name: SOURCE_NAMES.lastfm, value: lastfm.plays, fans: false });
  }
  if (listenbrainz && listenbrainz.plays !== null) {
    plays.push({ source: "listenbrainz", name: SOURCE_NAMES.listenbrainz, value: listenbrainz.plays, fans: false });
  }
  return [
    { kind: "listeners", entries: listeners },
    { kind: "plays", entries: plays },
  ];
}

export function figureLabelKey(kind: FigureKind, lead: FigureEntry | undefined): ParseKeys<"contentDetail"> {
  return lead?.fans ? "stats.fans" : FIGURE_LABEL_KEYS[kind];
}

export function bySourceKey(kind: FigureKind): ParseKeys<"contentDetail"> {
  return FIGURE_BY_SOURCE_KEYS[kind];
}
