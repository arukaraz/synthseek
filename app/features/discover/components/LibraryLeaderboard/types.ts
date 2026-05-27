export type LeaderboardMode = "artists" | "genres";

export interface LeaderboardEntry {
  name: string;
  count: number;
  image: string | null;
}

export interface LeaderboardSummary {
  tracks: number;
  hours: number;
  queued: number;
}
