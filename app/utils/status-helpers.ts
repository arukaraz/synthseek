import {
  ACTIVE_STATUSES,
  DropImportBatchStatus,
  FailureReason,
  RequestStatus,
  UNRESOLVED_STATUSES,
} from "@api/__generated__/types";

export function isProcessingStatus(status: RequestStatus): boolean {
  return (ACTIVE_STATUSES as readonly RequestStatus[]).includes(status);
}

export function isSpinningStatus(status: RequestStatus): boolean {
  return isProcessingStatus(status) && status !== RequestStatus.enum.queued;
}

export function isRetryableStatus(status: RequestStatus): boolean {
  return (UNRESOLVED_STATUSES as readonly RequestStatus[]).includes(status);
}

export function isRequestedStatus(status: RequestStatus | null): boolean {
  return status !== null && !isRetryableStatus(status);
}

const DROP_IMPORT_BATCH_SETTLED: Record<DropImportBatchStatus, boolean> = {
  [DropImportBatchStatus.enum.queued]: false,
  [DropImportBatchStatus.enum.processing]: false,
  [DropImportBatchStatus.enum.completed]: true,
  [DropImportBatchStatus.enum.partial]: true,
  [DropImportBatchStatus.enum.failed]: true,
};

export function isDropImportBatchInFlight(status: DropImportBatchStatus): boolean {
  return DROP_IMPORT_BATCH_SETTLED[status] !== true;
}

export function isReimportableFailure(
  reason: FailureReason | null | undefined,
  downloadedFile: string | null | undefined
): boolean {
  return reason === FailureReason.enum.import_rejected && !!downloadedFile;
}
