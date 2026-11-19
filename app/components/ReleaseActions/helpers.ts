import type { MyQuota } from "./types";

export function isQuotaFull(quota: MyQuota | undefined): boolean {
  if (quota === undefined || quota.exempt) return false;
  return quota.tracks.limit !== null && quota.tracks.used >= quota.tracks.limit;
}
