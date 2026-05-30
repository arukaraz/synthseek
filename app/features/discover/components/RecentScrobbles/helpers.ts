export function describeScrobbleAge(playedAt: string | null | undefined, nowMs: number): string {
  if (!playedAt) return "now";
  const diffMs = nowMs - new Date(playedAt).getTime();
  if (diffMs < 60_000) return "just now";
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
