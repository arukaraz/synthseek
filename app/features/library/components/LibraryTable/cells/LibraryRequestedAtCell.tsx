"use client";

import { formatRelativeTime } from "@utils/formatters";

import { durationText } from "../styles";
import type { LibraryRequestedAtCellProps } from "./types";

export function LibraryRequestedAtCell({ createdAt }: LibraryRequestedAtCellProps) {
  return <span className={durationText()}>{formatRelativeTime(new Date(createdAt))}</span>;
}
