import type { ChartEntry } from "@hooks/api/queries/analytics/types";

export function chartKey(entry: Pick<ChartEntry, "artist" | "title">): string {
  return `${entry.artist}-${entry.title}`;
}
