import type { AppRouter } from "@api/__generated__/types";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

export type RadioTracksInput = inferRouterInputs<AppRouter>["playback"]["radioTracks"];

export type RadioTracksResult = inferRouterOutputs<AppRouter>["playback"]["radioTracks"];
