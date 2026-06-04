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

export interface LeaderboardTabsProps {
  mode: LeaderboardMode;
  onChange: (mode: LeaderboardMode) => void;
}

export interface LeaderboardHeroProps {
  entry: LeaderboardEntry;
  mode: LeaderboardMode;
}

export interface LeaderboardRowsProps {
  entries: LeaderboardEntry[];
  maxCount: number;
}

export interface LibraryStatsRowProps {
  summary: LeaderboardSummary;
}
