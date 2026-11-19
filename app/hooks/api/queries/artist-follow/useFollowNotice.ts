import { useMyQuota } from "../useMyQuota";
import { useFollowPreferences } from "./useFollowPreferences";

export type FollowNotice = "approval" | "quota" | null;

export function useFollowNotice(): FollowNotice {
  const preferences = useFollowPreferences();
  const quota = useMyQuota();
  if (preferences.data?.requiresApproval) return "approval";
  const tracks = quota.data;
  if (tracks && !tracks.exempt && tracks.tracks.limit !== null) return "quota";
  return null;
}
