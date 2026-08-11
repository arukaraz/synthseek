import type { ParseKeys } from "i18next";

import type { DropImportBatchStatus, DropImportFileStatus } from "@api/__generated__/types";
import type { DropImportRejectedReason } from "@hooks/api";

import type { StatusChipTone } from "./styles";

export const ACCEPTED_UPLOAD_EXTENSIONS = ".mp3,.flac,.m4a,.ogg,.wav,.opus,.aac,.wma,.zip";

export const MATCH_SEARCH_LIMIT = 10;

export const FILE_STATUS_KEYS: Record<DropImportFileStatus, ParseKeys<"library">> = {
  received: "dropImport.fileStatus.received",
  identified: "dropImport.fileStatus.identified",
  importing: "dropImport.fileStatus.importing",
  imported: "dropImport.fileStatus.imported",
  already_in_library: "dropImport.fileStatus.already_in_library",
  pending_match: "dropImport.fileStatus.pending_match",
  discarded: "dropImport.fileStatus.discarded",
  failed: "dropImport.fileStatus.failed",
};

export const BATCH_STATUS_KEYS: Record<DropImportBatchStatus, ParseKeys<"library">> = {
  queued: "dropImport.batchStatus.queued",
  processing: "dropImport.batchStatus.processing",
  completed: "dropImport.batchStatus.completed",
  partial: "dropImport.batchStatus.partial",
  failed: "dropImport.batchStatus.failed",
};

export const FILE_STATUS_TONES: Record<DropImportFileStatus, StatusChipTone> = {
  received: "neutral",
  identified: "info",
  importing: "active",
  imported: "success",
  already_in_library: "info",
  pending_match: "warning",
  discarded: "neutral",
  failed: "danger",
};

export const BATCH_STATUS_TONES: Record<DropImportBatchStatus, StatusChipTone> = {
  queued: "neutral",
  processing: "active",
  completed: "success",
  partial: "warning",
  failed: "danger",
};

export const REJECTED_REASON_KEYS: Record<DropImportRejectedReason, ParseKeys<"library">> = {
  unsupportedType: "dropImport.rejected.reason.unsupportedType",
  zipSlip: "dropImport.rejected.reason.zipSlip",
  nestedArchive: "dropImport.rejected.reason.nestedArchive",
  batchCap: "dropImport.rejected.reason.batchCap",
  extractionError: "dropImport.rejected.reason.extractionError",
};
