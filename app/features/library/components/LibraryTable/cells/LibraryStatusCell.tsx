"use client";

import { TrackStatusIndicator } from "@components/TrackStatusIndicator";
import { formatRelativeTime } from "@utils/formatters";

import { durationText, statusCellStack } from "../styles";
import type { LibraryStatusCellProps } from "./types";

export function LibraryStatusCell({ status, createdAt }: LibraryStatusCellProps) {
  return (
    <div className={statusCellStack()}>
      <TrackStatusIndicator status={status} />
      <span className={durationText()}>{formatRelativeTime(new Date(createdAt))}</span>
    </div>
  );
}
