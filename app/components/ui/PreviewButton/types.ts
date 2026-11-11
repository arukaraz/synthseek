import type { PreviewClock, PreviewStatus, PreviewSubject } from "@hooks/ui/trackPreview";

export type PreviewButtonTone = "overlay" | "row";

export interface PreviewButtonProps {
  title: string;
  subject?: PreviewSubject;
  status: PreviewStatus;
  clock: PreviewClock | null;
  available: boolean;
  onToggle: () => void;
  tone?: PreviewButtonTone;
}

export interface PreviewRingProps {
  status: PreviewStatus;
  fraction: number;
  tone: PreviewButtonTone;
}

export interface PreviewStateLabelProps {
  state: "none" | "failed";
}

export interface PreviewTimeProps {
  clock: PreviewClock;
}
