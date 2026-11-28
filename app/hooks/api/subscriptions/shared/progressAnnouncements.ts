import {
  DropImportBatchStatus,
  RequestStatus,
  type AlbumUpdatePayload,
  type DropImportUpdatePayload,
  type LibraryImportProgressPayload,
  type PlaylistUpdatePayload,
} from "@api/__generated__/types";
import i18n from "@locale";
import { announce } from "@utils/announcer";
import { isProcessingStatus } from "@utils/status-helpers";

import { isForeignJobEvent } from "./eventOwnership";

type MilestoneState = "started" | "settled";

const PROGRESS_MILESTONE_MEMORY = 200;

const states = new Map<string, MilestoneState>();

function remember(key: string, state: MilestoneState): void {
  states.delete(key);
  states.set(key, state);
  if (states.size <= PROGRESS_MILESTONE_MEMORY) return;
  const oldest = states.keys().next();
  if (!oldest.done) states.delete(oldest.value);
}

function begin(key: string, text: string): void {
  if (states.get(key) === "started") return;
  remember(key, "started");
  announce(text);
}

function settle(key: string, text: string | null): void {
  if (states.get(key) === "settled") return;
  remember(key, "settled");
  if (text !== null) announce(text);
}

export function resetProgressAnnouncements(): void {
  states.clear();
}

function announceTrackedStatus(key: string, status: RequestStatus, done: { completed: number; total: number }): void {
  if (isProcessingStatus(status)) {
    begin(key, i18n.t("components:a11yMode.progress.downloadStarted"));
    return;
  }
  if (status === RequestStatus.enum.complete || status === RequestStatus.enum.partially_complete) {
    settle(key, i18n.t("components:a11yMode.progress.downloadFinished", { done: done.completed, total: done.total }));
    return;
  }
  if (status === RequestStatus.enum.failed) {
    settle(key, i18n.t("components:a11yMode.progress.downloadFailed"));
    return;
  }
  if (status === RequestStatus.enum.cancelled) settle(key, null);
}

export function announceAlbumProgress(event: AlbumUpdatePayload): void {
  announceTrackedStatus(`album:${event.albumId}`, event.status, {
    completed: event.completedTracks,
    total: event.totalTracks,
  });
}

export function announcePlaylistProgress(event: PlaylistUpdatePayload): void {
  announceTrackedStatus(`playlist:${event.playlistId}`, event.status, {
    completed: event.completedTracks,
    total: event.totalTracks,
  });
}

export function announceLibraryImport(event: LibraryImportProgressPayload, viewerId: string | null): void {
  if (isForeignJobEvent(event.userId, viewerId)) return;
  const key = `import:${event.jobId}`;
  if (event.phase === "start") {
    begin(key, i18n.t("components:a11yMode.progress.importStarted"));
    return;
  }
  if (event.phase !== "complete") return;
  if (event.imported === 0 && event.failed > 0) {
    settle(key, i18n.t("components:a11yMode.progress.importFailed"));
    return;
  }
  settle(
    key,
    i18n.t("components:a11yMode.progress.importFinished", { imported: event.imported, failed: event.failed })
  );
}

export function announceDropImport(event: DropImportUpdatePayload, viewerId: string | null): void {
  if (isForeignJobEvent(event.batch.user_id, viewerId)) return;
  const key = `drop:${event.batchId}`;
  const { status, imported_files: imported, failed_files: failed } = event.batch;
  if (status === DropImportBatchStatus.enum.queued || status === DropImportBatchStatus.enum.processing) {
    begin(key, i18n.t("components:a11yMode.progress.importStarted"));
    return;
  }
  if (status === DropImportBatchStatus.enum.failed) {
    settle(key, i18n.t("components:a11yMode.progress.importFailed"));
    return;
  }
  settle(key, i18n.t("components:a11yMode.progress.importFinished", { imported, failed }));
}
