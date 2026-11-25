"use client";

import { formatCount } from "@utils/formatters";

import { durationText } from "../styles";
import type { LibraryPlaysCellProps } from "./types";

export function LibraryPlaysCell({ plays }: LibraryPlaysCellProps) {
  return <span className={durationText()}>{plays > 0 ? formatCount(plays) : "--"}</span>;
}
