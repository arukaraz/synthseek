import { ACTIVE_STATUSES, RequestStatus } from "@api/__generated__/types";

export function isProcessingStatus(status: RequestStatus): boolean {
  return (ACTIVE_STATUSES as readonly RequestStatus[]).includes(status);
}

export function isSpinningStatus(status: RequestStatus): boolean {
  return isProcessingStatus(status) && status !== RequestStatus.enum.queued;
}
