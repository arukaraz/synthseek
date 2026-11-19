import type { AppRouter } from "@api/__generated__/types";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

type FollowOutputs = inferRouterOutputs<AppRouter>["artistFollow"];
type FollowInputs = inferRouterInputs<AppRouter>["artistFollow"];

export type FollowStatus = FollowOutputs["status"];
export type FollowListInput = FollowInputs["list"];
export type FollowList = FollowOutputs["list"];
export type FollowedArtist = FollowList["items"][number];
export type FollowSort = NonNullable<FollowListInput["sort"]>;
export type FollowFilter = NonNullable<FollowListInput["filter"]>;
export type FollowPreferences = FollowOutputs["preferences"];
export type FollowTypes = FollowPreferences["types"];
export type FollowTypeKey = keyof FollowTypes;
export type FollowCalendar = FollowOutputs["calendar"];
export type FollowRelease = FollowCalendar["items"][number];
export type FollowReleaseState = FollowRelease["state"];
export type FollowReleaseType = FollowRelease["type"];
export type FollowCalendarInput = FollowInputs["calendar"];
export type MostPlayedCandidate = FollowOutputs["mostPlayed"]["candidates"][number];
export type FollowBulkStatus = FollowOutputs["followMostPlayedStatus"];
export type FollowedRestore = FollowOutputs["unfollow"]["unfollowed"][number];
