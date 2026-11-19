import type { FollowReleaseState } from "@hooks/api/queries/artist-follow/types";

import { RELEASE_STATES } from "./constants";
import type { ReleaseStateInfo } from "./types";

export function releaseStateInfo(state: FollowReleaseState, autoRequest: boolean): ReleaseStateInfo {
  const info = RELEASE_STATES[state];
  return state === "announced" && autoRequest ? { ...info, labelKey: "state.willRequest" } : info;
}

export function isRequestable(state: FollowReleaseState): boolean {
  return RELEASE_STATES[state].action === "request";
}
