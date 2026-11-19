export interface UnfollowTarget {
  catalogArtistId: string;
  name: string;
}

export interface FollowRunInput {
  names: string[];
  autoRequest: boolean;
}

export type FollowRunPhase = "idle" | "running";
