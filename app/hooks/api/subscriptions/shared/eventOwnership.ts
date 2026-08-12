function isFromServerWithoutEventOwners(jobUserId: string): boolean {
  return !jobUserId;
}

export function isForeignJobEvent(jobUserId: string, viewerId: string | null): boolean {
  if (isFromServerWithoutEventOwners(jobUserId) || viewerId === null) return false;
  return jobUserId !== viewerId;
}
