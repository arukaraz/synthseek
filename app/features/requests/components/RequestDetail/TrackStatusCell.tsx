"use client";

import { TrackStatusIndicator } from "@components/ui/TrackStatusIndicator";

import type { TrackStatusCellProps } from "./types";

export function TrackStatusCell({ track }: TrackStatusCellProps) {
  return <TrackStatusIndicator status={track.status} failureReason={track.failure_reason} />;
}
