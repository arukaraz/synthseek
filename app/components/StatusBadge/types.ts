import type { RequestStatus } from "@api/__generated__/types";

export interface StatusBadgeProps {
  status: RequestStatus;
  size?: "sm" | "md" | "lg" | "xl";
  showIcon?: boolean;
  className?: string;
  showLabel?: boolean;
  hideLabelOnMobile?: boolean;
}
