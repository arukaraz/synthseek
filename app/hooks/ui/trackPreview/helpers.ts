import { TRACK_PREVIEW } from "./constants";
import type { PreviewClip, PreviewClock, PreviewSnapshot, PreviewStatus } from "./types";

export function catalogPreviewClip(trackId: string, title: string): PreviewClip {
  return {
    key: `${TRACK_PREVIEW.CATALOG_KEY_PREFIX}${trackId}`,
    subject: "preview",
    src: `${TRACK_PREVIEW.CATALOG_PATH_PREFIX}${encodeURIComponent(trackId)}${TRACK_PREVIEW.CATALOG_PATH_SUFFIX}`,
    title,
    fallbackSeconds: TRACK_PREVIEW.CLIP_SECONDS,
  };
}

export function libraryCopyAudioSrc(fileId: string): string {
  return `${TRACK_PREVIEW.FILE_PATH_PREFIX}${encodeURIComponent(fileId)}${TRACK_PREVIEW.FILE_PATH_SUFFIX}`;
}

export function fileAuditionClip(fileId: string, title: string, durationSeconds: number | null): PreviewClip {
  return {
    key: `${TRACK_PREVIEW.FILE_KEY_PREFIX}${fileId}`,
    subject: "file",
    src: libraryCopyAudioSrc(fileId),
    title,
    fallbackSeconds: durationSeconds,
  };
}

export function statusOf(snapshot: PreviewSnapshot, key: string): PreviewStatus {
  if (snapshot.failed.has(key)) return "error";
  return snapshot.key === key ? snapshot.status : "idle";
}

export function isSounding(status: PreviewStatus): boolean {
  return status === "loading" || status === "playing";
}

export function clockOf(elapsedSeconds: number, mediaSeconds: number, fallbackSeconds: number | null): PreviewClock {
  const measured = Number.isFinite(mediaSeconds) && mediaSeconds > 0 ? mediaSeconds : (fallbackSeconds ?? 0);
  const totalSeconds = Math.round(measured);
  const elapsed = Math.max(elapsedSeconds, 0);
  return { elapsedSeconds: totalSeconds > 0 ? Math.min(elapsed, totalSeconds) : elapsed, totalSeconds };
}

export function clockFraction(clock: PreviewClock | null): number {
  if (clock === null || clock.totalSeconds <= 0) return 0;
  return Math.min(clock.elapsedSeconds / clock.totalSeconds, 1);
}
