import type { DockItem, DockItemState, DockJob, DockJobKind, DockJobStatus } from "@hooks/api/subscriptions";

export interface DockCounts {
  done: number;
  skipped: number;
  failed: number;
  total: number;
}

export interface DockSubtitle {
  accent: string;
  accentTone: "sync" | "error";
  rest: string;
}

export type DockPresentation =
  | { indicator: "ring"; ratio: number; percent: number }
  | { indicator: "spinner" }
  | { indicator: "status-icon"; status: DockJobStatus };

export interface DockControls {
  toggle: boolean;
  close: boolean;
}

export interface DockCardModel {
  counts: DockCounts;
  presentation: DockPresentation;
  controls: DockControls;
  title: string;
  subtitle: DockSubtitle;
  wrapSubtitle: boolean;
  mobileMeta: string;
}

export interface ProgressDockCardProps {
  job: DockJob;
  counts: DockCounts;
  presentation: DockPresentation;
  controls: DockControls;
  title: string;
  subtitle: DockSubtitle;
  wrapSubtitle: boolean;
  mobileMeta: string;
  minimized: boolean;
  reduced: boolean;
  onToggleMinimize: () => void;
  onDismiss: () => void;
}

export interface DockRingProps {
  ratio: number;
  percent: number;
  status: DockJobStatus;
}

export interface DockItemRowProps {
  item: DockItem;
  reduced: boolean;
  label: string;
  reasonLabel: string;
  skippedLabel: string;
}

export type { DockItem, DockItemState, DockJob, DockJobKind, DockJobStatus };
