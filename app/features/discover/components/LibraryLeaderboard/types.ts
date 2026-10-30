import type { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@api/__generated__/types";

export type LibrarySummary = inferRouterOutputs<AppRouter>["requests"]["getLibrarySummary"];

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
  onSelect?: (name: string) => void;
}

export interface LeaderboardRowsProps {
  entries: LeaderboardEntry[];
  maxCount: number;
  onSelect?: (name: string) => void;
}

export interface LibraryStatsRowProps {
  summary: LeaderboardSummary;
}

export interface LeaderboardRankingProps {
  mode: LeaderboardMode;
  entries: LeaderboardEntry[];
  compact: boolean;
  onSelect?: (name: string) => void;
  onModeChange?: (mode: LeaderboardMode) => void;
}
