"use client";

import { TrackStatusIndicator } from "@components/ui/TrackStatusIndicator";

import { TrackWatchHint } from "./TrackWatchHint";
import type { TrackStatusCellProps } from "./types";

export function TrackStatusCell({ track }: TrackStatusCellProps) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <TrackStatusIndicator status={track.status} failureReason={track.failure_reason} />
      <TrackWatchHint track={track} />
    </div>
  );
}
