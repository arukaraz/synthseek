"use client";

import { useTranslation } from "react-i18next";

import { statsLabel, statsRow, statsValue } from "./styles";
import type { LibraryStatsRowProps } from "./types";

export function LibraryStatsRow({ summary }: LibraryStatsRowProps) {
  const { t } = useTranslation("discover");

  const cells = [
    { value: summary.tracks.toLocaleString(), label: t("leaderboard.statsTracks") },
    { value: `${summary.hours}h`, label: t("leaderboard.statsLibrary") },
    { value: summary.queued.toLocaleString(), label: t("leaderboard.statsQueued") },
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
