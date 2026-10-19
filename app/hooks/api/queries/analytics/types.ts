import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@api/__generated__/types";

type AnalyticsOutputs = inferRouterOutputs<AppRouter>["analytics"];
type ListeningOutputs = AnalyticsOutputs["listening"];

export type ClockPeriod = inferRouterInputs<AppRouter>["analytics"]["listening"]["clock"]["period"];
export type QualityFormat = AnalyticsOutputs["library"]["quality"]["formats"][number];
export type Decade = AnalyticsOutputs["library"]["decades"][number];
export type ScrobbleHealth = AnalyticsOutputs["pipeline"]["scrobbleHealth"][number];
export type RecentPlay = AnalyticsOutputs["listening"]["recentPlays"][number];
export type RecentAlbum = AnalyticsOutputs["library"]["recentAlbums"][number];
export type DiscographyGap = AnalyticsOutputs["library"]["gaps"][number];
export type CatalogAlbumRef = DiscographyGap["missing"][number];
export type Anniversary = AnalyticsOutputs["library"]["anniversaries"][number];
export type ServerPlaylist = AnalyticsOutputs["library"]["serverPlaylists"][number];
export type OrbitAlbum = AnalyticsOutputs["discover"]["orbit"][number];
export type ChartEntry = AnalyticsOutputs["discover"]["charts"][number];
export type Rarity = AnalyticsOutputs["discover"]["rarities"]["items"][number];
export type LovedTrack = Extract<AnalyticsOutputs["discover"]["loved"], { status: "ready" }>["tracks"][number];

export type ListeningMix = ListeningOutputs["onRepeat"];
export type UnfinishedAlbum = ListeningOutputs["jumpBackIn"][number];
export type LastYearWeek = ListeningOutputs["lastYear"];
export type Station = ListeningOutputs["stations"][number];
