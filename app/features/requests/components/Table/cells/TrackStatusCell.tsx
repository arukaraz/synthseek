"use client";

import { cn } from "@utils/cn";
import { REQUEST_STATUS_CONFIG } from "@utils/statusConfig";
import type { TrackStatusCellProps } from "../types";

export function TrackStatusCell({ status }: TrackStatusCellProps) {
  const statusConfig = REQUEST_STATUS_CONFIG[status];

  return (
    <div className="flex items-center gap-2">
      <div className={cn("h-2 w-2 rounded-full", statusConfig.glowColor)} />
      <span className={cn("text-xs font-medium", statusConfig.color)}>{statusConfig.label}</span>
    </div>
  );
}
