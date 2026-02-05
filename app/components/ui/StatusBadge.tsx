"use client";

import type { RequestStatus } from "@api/__generated__/types";
import { cn } from "@utils/cn";
import { REQUEST_STATUS_CONFIG } from "@utils/statusConfig";

interface StatusBadgeProps {
  status: RequestStatus;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
  showLabel?: boolean;
}

const sizeClasses = {
  sm: "px-1.5 py-0.5 text-xs gap-0.5",
  md: "px-2 py-0.5 text-sm gap-1",
  lg: "px-2.5 py-1 text-base gap-1.5",
};

const iconSizes = {
  sm: "h-2.5 w-2.5",
  md: "h-3 w-3",
  lg: "h-3.5 w-3.5",
};

export function StatusBadge({ status, size = "sm", showIcon = false, showLabel = true, className }: StatusBadgeProps) {
  const statusInfo = REQUEST_STATUS_CONFIG[status];
  const Icon = statusInfo.icon;

  return (
    <span
      data-status={status}
      data-testid="status-badge"
      className={cn(
        "bg-surface/20 inline-flex items-center rounded-md border font-medium whitespace-nowrap",
        statusInfo.borderColor,
        statusInfo.color,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {showLabel && statusInfo.label}
    </span>
  );
}
