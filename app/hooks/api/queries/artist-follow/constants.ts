import type { FollowListInput } from "./types";

export const FOLLOW_RUN_POLL_MS = 1500;

export const FOLLOW_FIRST_PAGE: FollowListInput = { sort: "name", filter: "all", page: 1 };

export const FOLLOW_NEWEST_FIRST: FollowListInput = { sort: "followedAt", filter: "all", page: 1 };
