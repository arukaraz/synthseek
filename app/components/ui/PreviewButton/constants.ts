import type { ParseKeys } from "i18next";

import type { PreviewNotice, PreviewSubject } from "@hooks/ui/trackPreview";

export const PREVIEW_RING = {
  VIEW_BOX: "0 0 44 44",
  CENTER: 22,
  RADIUS: 20,
  CIRCUMFERENCE: 2 * Math.PI * 20,
  LOADING_ARC: 0.25,
} as const;

export const PREVIEW_TOOLTIP_DELAY_MS = 150;

export const PREVIEW_ACTION_KEYS: Record<
  PreviewSubject,
  Record<"play" | "stop" | "playHint" | "stopHint" | "failed" | "failedHint", ParseKeys<"components">>
> = {
  preview: {
    play: "preview.play",
    stop: "preview.stop",
    playHint: "preview.playHint",
    stopHint: "preview.stopHint",
    failed: "preview.failed",
    failedHint: "preview.failedHint",
  },
  file: {
    play: "preview.filePlay",
    stop: "preview.fileStop",
    playHint: "preview.filePlayHint",
    stopHint: "preview.fileStopHint",
    failed: "preview.fileFailed",
    failedHint: "preview.fileFailedHint",
  },
};

export const PREVIEW_NOTICE_KEYS: Record<
  PreviewSubject,
  Record<PreviewNotice["kind"], { plain: ParseKeys<"components">; withPlayer: ParseKeys<"components"> }>
> = {
  preview: {
    playing: { plain: "preview.notice.playing", withPlayer: "preview.notice.playingHeld" },
    stopped: { plain: "preview.notice.stopped", withPlayer: "preview.notice.stoppedResumes" },
    ended: { plain: "preview.notice.ended", withPlayer: "preview.notice.endedResumes" },
    failed: { plain: "preview.notice.failed", withPlayer: "preview.notice.failedResumes" },
    interrupted: { plain: "preview.notice.interrupted", withPlayer: "preview.notice.interrupted" },
  },
  file: {
    playing: { plain: "preview.fileNotice.playing", withPlayer: "preview.fileNotice.playingHeld" },
    stopped: { plain: "preview.fileNotice.stopped", withPlayer: "preview.fileNotice.stoppedResumes" },
    ended: { plain: "preview.fileNotice.ended", withPlayer: "preview.fileNotice.endedResumes" },
    failed: { plain: "preview.fileNotice.failed", withPlayer: "preview.fileNotice.failedResumes" },
    interrupted: { plain: "preview.fileNotice.interrupted", withPlayer: "preview.fileNotice.interrupted" },
  },
};
