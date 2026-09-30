import type { CodedError } from "@modules/errors";

export type DockItemState = "pending" | "importing" | "done" | "failed" | "skipped";

export type DockJobKind = "playlist-sync" | "library-import" | "file-import" | "request" | "review-approve";

export type DockJobStatus = "running" | "complete" | "partial" | "failed";

export type LibraryImportFailureReason =
  | "notInLibrary"
  | "noMatchableTracks"
  | "sourceHasNoTracks"
  | "quotaExceeded"
  | "importError";

export interface DockItem {
  key: string;
  name: string;
  state: DockItemState;
  reason?: LibraryImportFailureReason;
}

export interface PlaylistSyncSeedItem {
  id: string;
  name: string;
  state?: DockItemState;
}

export interface DockJob {
  id: string;
  kind: DockJobKind;
  provider?: string;
  requestId?: string;
  items: DockItem[];
  status: DockJobStatus;
  failure?: CodedError | null;
  updatedAt: number;
}
