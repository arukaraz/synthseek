"use client";

import { statsLabel, statsRow, statsValue } from "./styles";
import type { LeaderboardSummary } from "./types";

interface LibraryStatsRowProps {
  summary: LeaderboardSummary;
}

export function LibraryStatsRow({ summary }: LibraryStatsRowProps) {
  const cells = [
    { value: summary.tracks.toLocaleString(), label: "Tracks" },
    { value: `${summary.hours}h`, label: "Listened" },
    { value: summary.queued.toLocaleString(), label: "Queued" },
  ];

  return (
    <div className={statsRow()}>
      {cells.map((cell, index) => (
        <div key={cell.label} className={index > 0 ? "border-fg/10 border-l py-3" : "py-3"}>
          <div className={statsValue()}>{cell.value}</div>
          <div className={statsLabel()}>{cell.label}</div>
        </div>
      ))}
    </div>
  );
}
