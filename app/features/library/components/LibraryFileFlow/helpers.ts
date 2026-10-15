import type {
  LibraryFileSelection,
  LibraryFilesStatus,
  LibraryMovePreview,
  LibraryPathRecord,
} from "@hooks/api/queries/library/types";
import type { BulkAction } from "@components/ui/BulkActionBar";
import i18n from "@locale";
import { formatBytes } from "@utils/formatters";
import { FolderInput, Trash2 } from "lucide-react";

import type { LibraryFileActions, LibraryFileJob, LibraryFileTarget } from "../../types";
import { PATH_STATE_KEYS } from "./constants";
import type { DeleteCopy, FileJobSummary, PathOptionState } from "./types";

export function fileSelectionOf(target: LibraryFileTarget): LibraryFileSelection {
  switch (target.scope) {
    case "track":
      return { trackIds: [target.trackId], albumIds: [] };
    case "album":
      return { trackIds: [], albumIds: [target.albumId] };
    case "tracks":
      return { trackIds: target.trackIds, albumIds: [] };
    case "albums":
      return { trackIds: [], albumIds: target.albumIds };
  }
}

export function fileBulkActions(target: LibraryFileTarget, count: number, actions: LibraryFileActions): BulkAction[] {
  if (count === 0) return [];
  const remove: BulkAction = {
    icon: Trash2,
    label: i18n.t("library:page.actions.deleteFiles"),
    onClick: () => actions.openDelete(target),
    count,
  };
  if (!actions.canMove) return [remove];
  return [
    {
      icon: FolderInput,
      label: i18n.t("library:page.actions.moveToPath"),
      onClick: () => actions.openMove(target),
      count,
    },
    remove,
  ];
}

export function pathOptionState(path: LibraryPathRecord, sourcePathIds: readonly string[]): PathOptionState {
  if (!path.enabled) return "disabled";
  switch (path.access) {
    case "readonly":
      return "readonly";
    case "missing":
    case "not_directory":
    case "unreachable":
      return "unreachable";
    case "writable":
      return sourcePathIds.length === 1 && sourcePathIds[0] === path.id ? "current" : "available";
  }
}

export function pathOptionDetail(path: LibraryPathRecord, state: PathOptionState): string {
  if (state !== "available") return i18n.t(`library:${PATH_STATE_KEYS[state]}`);
  if (path.freeBytes === null) return i18n.t("library:files.move.freeUnknown");
  return i18n.t("library:files.move.free", { size: formatBytes(path.freeBytes) });
}

export function movableCount(preview: LibraryMovePreview | undefined): number {
  return preview?.outcome === "ready" ? preview.tracks : 0;
}

export function moveTitle(target: LibraryFileTarget): string {
  switch (target.scope) {
    case "track":
      return i18n.t("library:files.move.titleTrack", { title: target.title });
    case "album":
      return i18n.t("library:files.move.titleAlbum", { name: target.name });
    case "tracks":
      return i18n.t("library:files.move.titleTracks", { count: target.trackIds.length });
    case "albums":
      return i18n.t("library:files.move.titleAlbums", { count: target.albumIds.length });
  }
}

export function deleteCopy(target: LibraryFileTarget): DeleteCopy {
  switch (target.scope) {
    case "track":
      return {
        title: i18n.t("library:files.delete.titleTrack", { title: target.title }),
        message: i18n.t("library:files.delete.messageOne"),
        confirm: i18n.t("library:files.delete.confirmOne"),
      };
    case "album":
      return {
        title: i18n.t("library:files.delete.titleAlbum", { name: target.name }),
        message: i18n.t("library:files.delete.messageMany"),
        confirm: i18n.t("library:files.delete.confirmMany"),
      };
    case "albums":
      return {
        title: i18n.t("library:files.delete.titleAlbums", { count: target.albumIds.length }),
        message: i18n.t("library:files.delete.messageMany"),
        confirm: i18n.t("library:files.delete.confirmMany"),
      };
    case "tracks": {
      const single = target.trackIds.length === 1;
      return {
        title: i18n.t("library:files.delete.titleTracks", { count: target.trackIds.length }),
        message: single ? i18n.t("library:files.delete.messageOne") : i18n.t("library:files.delete.messageMany"),
        confirm: single ? i18n.t("library:files.delete.confirmOne") : i18n.t("library:files.delete.confirmMany"),
      };
    }
  }
}

export function fileJobSummary(job: LibraryFileJob, status: LibraryFilesStatus): FileJobSummary {
  const tone = status.failed === 0 ? "success" : status.done === 0 ? "error" : "warning";
  if (job.kind === "move") {
    const label = job.targetLabel;
    if (tone === "success") return { tone, title: i18n.t("library:files.result.moved", { count: status.done, label }) };
    if (tone === "error") return { tone, title: i18n.t("library:files.result.moveFailed") };
    return {
      tone,
      title: i18n.t("library:files.result.movedPartly", { done: status.done, total: status.total, label }),
    };
  }
  if (tone === "success") return { tone, title: i18n.t("library:files.result.deleted", { count: status.done }) };
  if (tone === "error") return { tone, title: i18n.t("library:files.result.deleteFailed") };
  return { tone, title: i18n.t("library:files.result.deletedPartly", { done: status.done, total: status.total }) };
}

export function jobPercent(status: LibraryFilesStatus | null): number {
  if (status === null || status.total <= 0) return 0;
  return Math.round((status.processed / status.total) * 100);
}
