import type {
  LibraryFileFailure,
  LibraryFilesStatus,
  LibraryMovePreview,
  LibraryPathRecord,
} from "@hooks/api/queries/library/types";

import type { LibraryFileActions, LibraryFileJob, LibraryFileRequest, LibraryFileTarget } from "../../types";

export type PathOptionState = "available" | "current" | "disabled" | "readonly" | "unreachable";

export type FileFailureReason = LibraryFileFailure["reason"];

export type FileJobTone = "success" | "warning" | "error";

export interface FileJobSummary {
  tone: FileJobTone;
  title: string;
}

export interface LibraryFileFlowProps {
  request: LibraryFileRequest | null;
  onClose: () => void;
  onStarted: (request: LibraryFileRequest) => void;
}

export interface MoveFilesDialogProps {
  target: LibraryFileTarget;
  pending: boolean;
  onCancel: () => void;
  onConfirm: (path: LibraryPathRecord) => void;
}

export interface MovePathOptionsProps {
  paths: LibraryPathRecord[] | undefined;
  isLoading: boolean;
  isError: boolean;
  sourcePathIds: readonly string[];
  selected: string | null;
  onSelect: (pathId: string) => void;
}

export interface MovePreviewPanelProps {
  path: LibraryPathRecord;
  preview: LibraryMovePreview | undefined;
  isLoading: boolean;
  isError: boolean;
}

export interface FileJobDialogProps {
  job: LibraryFileJob;
  report: LibraryFilesStatus | null;
  onHide: () => void;
}

export interface FileFailureListProps {
  failures: LibraryFileFailure[];
  failedCount: number;
}

export interface FileActionMenuItemsProps {
  target: LibraryFileTarget;
  actions: LibraryFileActions;
}

export interface DeleteCopy {
  title: string;
  message: string;
  confirm: string;
}
