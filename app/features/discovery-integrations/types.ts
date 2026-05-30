import type { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@api/__generated__/types";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type DiscoveryConfig = RouterOutputs["discovery"]["getConfig"];
export type LbConfig = DiscoveryConfig["integrations"]["listenbrainz"];
export type LfmConfig = DiscoveryConfig["integrations"]["lastfm"];
export type LbPlaylistKind = "cf-recommendations" | "weekly-exploration" | "weekly-jams" | "daily-jams";
export type LfmFeedKind = "recent-tracks" | "top-tracks-overall";
export type LfmInterval = "5m" | "10m" | "15m" | "30m" | "1h" | "daily" | "weekly";

export interface LastfmCandidate {
  catalogTrackId: string;
  title: string;
  artist: string;
  albumExternalId: string;
  albumName: string;
  albumArtist: string;
  albumImage: string | null;
  isrc: string | null;
  durationMs: number;
  trackNumber: number;
  discNumber: number;
  explicit: boolean;
  popularity: number | null;
  rank: number;
  playedAt?: string | null;
  playcount?: number | null;
}

export type LastfmFeed =
  | { status: "ready"; candidates: LastfmCandidate[]; generatedAt: string }
  | { status: "empty"; candidates: []; reason?: string; generatedAt?: string };
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6 | "daily";
export interface ScheduleSpec {
  dayOfWeek: DayOfWeek;
  hour: number;
}

export interface DiscoveryCardProps {
  className?: string;
}

export interface ListenBrainzCardProps {
  config: LbConfig;
}

export interface LastfmCardProps {
  config: LfmConfig;
}

export interface ScheduleDayHourPickerProps {
  value: ScheduleSpec;
  onChange: (next: ScheduleSpec) => void;
  disabled?: boolean;
}
