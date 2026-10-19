import type { ResumePoint } from "@hooks/ui/player";

export function resumeProgress(point: ResumePoint): number {
  const duration = point.track.durationSeconds;
  if (duration <= 0) return 0;
  return Math.min(100, (point.positionSeconds / duration) * 100);
}
