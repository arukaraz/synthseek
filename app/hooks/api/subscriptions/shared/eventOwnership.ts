export function isForeignJobEvent(jobUserId: string, viewerId: string | null): boolean {
  if (!jobUserId || viewerId === null) return false;
  return jobUserId !== viewerId;
}
