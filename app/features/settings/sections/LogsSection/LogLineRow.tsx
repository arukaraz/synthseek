"use client";

import { cn } from "@utils/cn";

import { logLine, logRequestId, LOG_LEVEL_DEFAULT_CLASS, LOG_LEVEL_STYLES } from "./styles";
import type { LogLineRowProps } from "./types";

export function LogLineRow({ entry }: LogLineRowProps) {
  const colorClass = entry.level ? LOG_LEVEL_STYLES[entry.level] : LOG_LEVEL_DEFAULT_CLASS;
  const marker = entry.requestId ? `[${entry.requestId}]` : null;
  const markerIndex = marker ? entry.raw.indexOf(marker) : -1;

  if (!marker || markerIndex === -1) {
    return <div className={cn(logLine(), colorClass)}>{entry.raw}</div>;
  }

  return (
    <div className={cn(logLine(), colorClass)}>
      {entry.raw.slice(0, markerIndex)}
      <span className={logRequestId()}>{marker}</span>
      {entry.raw.slice(markerIndex + marker.length)}
    </div>
  );
}
