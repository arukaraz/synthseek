export type PreviewStatus = "idle" | "loading" | "playing" | "error";

export type PreviewSubject = "preview" | "file";

export interface PreviewClip {
  key: string;
  subject: PreviewSubject;
  src: string;
  title: string;
  fallbackSeconds: number | null;
}

export type PreviewNoticeKind = "playing" | "stopped" | "ended" | "failed" | "interrupted";

export interface PreviewNotice {
  kind: PreviewNoticeKind;
  subject: PreviewSubject;
  title: string;
  resumesPlayer: boolean;
}

export interface PreviewSnapshot {
  key: string | null;
  status: PreviewStatus;
  failed: ReadonlySet<string>;
  notice: PreviewNotice | null;
}

export interface PreviewClock {
  elapsedSeconds: number;
  totalSeconds: number;
}

export interface TrackPreview {
  status: PreviewStatus;
  active: boolean;
  clock: PreviewClock | null;
  toggle: () => void;
  seek: (seconds: number) => void;
}
