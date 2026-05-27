"use client";

import { cn } from "@utils/cn";
import { REQUEST_STATUS_CONFIG } from "@utils/statusConfig";
import { iconSizes, sizeClasses } from "./styles";
import type { StatusBadgeProps } from "./types";

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
