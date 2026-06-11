import type { DockItem, DockItemState, DockJob, DockJobKind, DockJobStatus } from "@hooks/api/subscriptions";

export interface DockCounts {
  done: number;
  failed: number;
  total: number;
}

export interface DockSubtitle {
  accent: string;
  accentTone: "sync" | "error";
  rest: string;
}

export interface ProgressDockCardProps {
  job: DockJob;
  counts: DockCounts;
  ratio: number;
  percent: number;
  title: string;
  subtitle: DockSubtitle;
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
}

export type { DockItem, DockItemState, DockJob, DockJobKind, DockJobStatus };
