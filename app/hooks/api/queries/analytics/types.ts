import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@api/__generated__/types";

type AnalyticsOutputs = inferRouterOutputs<AppRouter>["analytics"];
type ListeningOutputs = AnalyticsOutputs["listening"];

export type ClockPeriod = inferRouterInputs<AppRouter>["analytics"]["listening"]["clock"]["period"];
export type QualityFormat = AnalyticsOutputs["library"]["quality"]["formats"][number];
export type Decade = AnalyticsOutputs["library"]["decades"][number];
export type ScrobbleHealth = AnalyticsOutputs["pipeline"]["scrobbleHealth"][number];

export type ListeningMix = ListeningOutputs["onRepeat"];
export type UnfinishedAlbum = ListeningOutputs["jumpBackIn"][number];
export type LastYearWeek = ListeningOutputs["lastYear"];
export type LastYearTrack = LastYearWeek["tracks"][number];
export type Station = ListeningOutputs["stations"][number];
