import { ACTIVE_STATUSES, FailureReason, RequestStatus, UNRESOLVED_STATUSES } from "@api/__generated__/types";

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

export function isReimportableFailure(
  reason: FailureReason | null | undefined,
  downloadedFile: string | null | undefined
): boolean {
  return reason === FailureReason.enum.import_rejected && !!downloadedFile;
}
