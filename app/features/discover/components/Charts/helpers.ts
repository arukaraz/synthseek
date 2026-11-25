import type { ChartEntry } from "@hooks/api/queries/analytics/types";

import type { WidgetItem } from "../CustomWidget/types";

export function chartKey(entry: Pick<ChartEntry, "artist" | "title">): string {
  return `${entry.artist}-${entry.title}`;
}

export function chartItem(entry: ChartEntry): WidgetItem {
  return {
    key: chartKey(entry),
    title: entry.title,
    subtitle: entry.artist,
    cover: entry.track?.album.images[0]?.url ?? null,
    value: null,
    date: null,
    move: null,
    play: entry.libraryTrackId ? { kind: "tracks", trackIds: [entry.libraryTrackId] } : null,
    request: entry.track,
    open: null,
    link: null,
  };
}
