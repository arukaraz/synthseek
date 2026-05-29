import type { LbPlaylistKind, LfmInterval } from "./types";

export const LFM_INTERVAL_OPTIONS: { value: LfmInterval; label: string }[] = [
  { value: "5m", label: "Every 5 minutes" },
  { value: "10m", label: "Every 10 minutes" },
  { value: "15m", label: "Every 15 minutes" },
  { value: "30m", label: "Every 30 minutes" },
  { value: "1h", label: "Every hour" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
];

export const LB_PLAYLIST_KIND_OPTIONS: { value: LbPlaylistKind; label: string; description: string }[] = [
  {
    value: "cf-recommendations",
    label: "CF Recommendations",
    description: "Raw collaborative filtering output. Available immediately, less curated.",
  },
  {
    value: "weekly-exploration",
    label: "Weekly Exploration",
    description: "LB's Discover Weekly equivalent. Refreshes Mondays.",
  },
  {
    value: "weekly-jams",
    label: "Weekly Jams",
    description: "Curated remix of your favorites. Refreshes Mondays.",
  },
  {
    value: "daily-jams",
    label: "Daily Jams",
    description: "Daily rotation from your listening history.",
  },
];
