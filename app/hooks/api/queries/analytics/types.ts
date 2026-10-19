import type { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@api/__generated__/types";

type ListeningOutputs = inferRouterOutputs<AppRouter>["analytics"]["listening"];

export type ListeningMix = ListeningOutputs["onRepeat"];
export type UnfinishedAlbum = ListeningOutputs["jumpBackIn"][number];
export type LastYearWeek = ListeningOutputs["lastYear"];
export type LastYearTrack = LastYearWeek["tracks"][number];
export type Station = ListeningOutputs["stations"][number];
