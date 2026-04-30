"use client";

import { type RequestStatus } from "@api/__generated__/types";
import { cn } from "@utils/cn";
import { REQUEST_STATUS_CONFIG } from "@utils/statusConfig";

interface TrackStatusCellProps {
  status: RequestStatus;
}

export function TrackStatusCell({ status }: TrackStatusCellProps) {
  const statusConfig = REQUEST_STATUS_CONFIG[status];

  return (
    <div className="flex items-center gap-2">
      <div className={cn("h-2 w-2 rounded-full", statusConfig.glowColor)} />
      <span className={cn("text-xs font-medium", statusConfig.color)}>{statusConfig.label}</span>
    </div>
  );
}
