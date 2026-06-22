import type { FailureReason, RequestStatus } from "@api/__generated__/types";

export interface TrackStatusIndicatorProps {
  status: RequestStatus;
  failureReason?: FailureReason | null;
  hideLabel?: boolean;
}

export interface TrackStatusIconProps {
  status: RequestStatus;
}
