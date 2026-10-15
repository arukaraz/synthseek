import type { LibraryKey } from "../../types";
import type { FileFailureReason, PathOptionState } from "./types";

export const FAILURE_PREVIEW_LIMIT = 5;

export const FAILURE_REASON_KEYS: Record<FileFailureReason, LibraryKey> = {
  PATH_UNAVAILABLE: "files.failure.PATH_UNAVAILABLE",
  READ_ONLY: "files.failure.READ_ONLY",
  OCCUPIED: "files.failure.OCCUPIED",
  NO_SPACE: "files.failure.NO_SPACE",
  MOVE_FAILED: "files.failure.MOVE_FAILED",
  RECYCLE_FAILED: "files.failure.RECYCLE_FAILED",
  LIBRARY_NOT_UPDATED: "files.failure.LIBRARY_NOT_UPDATED",
};

export const PATH_STATE_KEYS: Record<Exclude<PathOptionState, "available">, LibraryKey> = {
  current: "files.move.pathState.current",
  disabled: "files.move.pathState.disabled",
  readonly: "files.move.pathState.readonly",
  unreachable: "files.move.pathState.unreachable",
};
