"use client";

import { cn } from "@utils/cn";

import { statusBadge, statusDot } from "../../styles";
import { SLSKD_STATUS_LABEL, SLSKD_STATUS_TONE } from "./constants";
import type { SlskdStatusBadgeProps } from "./types";

export function SlskdStatusBadge({ status, message }: SlskdStatusBadgeProps) {
  const tone = SLSKD_STATUS_TONE[status];

  return (
    <div className="flex flex-col gap-1">
      <span role="status" aria-live="polite" className={cn(statusBadge({ tone }))}>
        <span className={statusDot({ tone })} />
        {SLSKD_STATUS_LABEL[status]}
      </span>
      {message ? <p className="text-fg/55 text-xs">{message}</p> : null}
    </div>
  );
}
