"use client";

import { formatTrackDuration } from "@utils/formatters";

import { durationText } from "../styles";
import type { LibraryDurationCellProps } from "./types";

export function LibraryDurationCell({ durationMs }: LibraryDurationCellProps) {
  if (durationMs <= 0) {
    return <span className={durationText()}>--</span>;
  }
  return <span className={durationText()}>{formatTrackDuration(durationMs)}</span>;
}
