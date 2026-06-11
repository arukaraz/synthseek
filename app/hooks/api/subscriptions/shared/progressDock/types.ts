export type DockItemState = "pending" | "importing" | "done" | "failed" | "skipped";

export type DockJobKind = "plex-sync" | "library-import" | "file-import";

export type DockJobStatus = "running" | "complete" | "partial" | "failed";

export interface DockItem {
  key: string;
  name: string;
  state: DockItemState;
}

export interface DockJob {
  id: string;
  kind: DockJobKind;
  provider?: string;
  items: DockItem[];
  status: DockJobStatus;
  updatedAt: number;
}
