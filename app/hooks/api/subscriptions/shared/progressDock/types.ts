export type DockItemState = "pending" | "importing" | "done" | "failed" | "skipped";

export type DockJobKind = "plex-sync" | "library-import" | "file-import" | "request";

export type DockJobStatus = "running" | "complete" | "partial" | "failed";

export type LibraryImportFailureReason = "notInLibrary" | "noMatchableTracks" | "sourceHasNoTracks" | "importError";

export interface DockItem {
  key: string;
  name: string;
  state: DockItemState;
  reason?: LibraryImportFailureReason;
}

export interface DockJob {
  id: string;
  kind: DockJobKind;
  provider?: string;
  requestId?: string;
  items: DockItem[];
  status: DockJobStatus;
  updatedAt: number;
}
