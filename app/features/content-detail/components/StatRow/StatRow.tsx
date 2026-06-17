"use client";

import { formatStat } from "../../helpers";
import { statCell, statLabel, statRow, statValue } from "../../styles";
import type { StatRowProps } from "./types";

export function StatRow({ stats }: StatRowProps) {
  return (
    <div className={statRow()}>
      {stats.map((stat) => (
        <div key={stat.label} className={statCell()}>
          <span className={statValue()}>{formatStat(stat.value)}</span>
          <span className={statLabel()}>{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
