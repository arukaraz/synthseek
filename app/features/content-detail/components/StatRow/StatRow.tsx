"use client";

import { formatStat } from "../../helpers";
import { statCell, statLabel, statRow, statValue } from "../../styles";
import type { StatRowProps } from "./types";

export function StatRow({ stats, layout = "aside" }: StatRowProps) {
  return (
    <div className={statRow({ layout })}>
      {stats.map((stat) => (
        <div key={stat.label} className={statCell({ layout })}>
          <span className={statValue({ layout })}>{formatStat(stat.value)}</span>
          <span className={statLabel({ layout })}>{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
