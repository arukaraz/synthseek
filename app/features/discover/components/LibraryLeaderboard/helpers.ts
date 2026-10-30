import { TOP_LIMIT } from "./constants";
import type { LeaderboardEntry, LeaderboardMode, LibrarySummary } from "./types";

export function leaderboardEntries(summary: LibrarySummary, mode: LeaderboardMode): LeaderboardEntry[] {
  if (mode === "artists") {
    return summary.topArtists.slice(0, TOP_LIMIT).map((row) => ({
      name: row.artist,
      count: row.trackCount,
      image: row.image,
    }));
  }
  return summary.topGenres.slice(0, TOP_LIMIT).map((row) => ({
    name: row.genre,
    count: row.albumCount,
    image: row.image,
  }));
}
