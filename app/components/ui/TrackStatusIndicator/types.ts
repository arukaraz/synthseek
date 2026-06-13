import type { FailureReason, RequestStatus } from "@api/__generated__/types";

export interface TrackStatusIndicatorProps {
  status: RequestStatus;
  failureReason?: FailureReason | null;
}

export interface TrackStatusIconProps {
  status: RequestStatus;
}
