"use client";

import { BLOCK_LIMITS } from "./constants";
import { deltaText } from "./helpers";
import { blockBody, statCell, statDelta, statLabel, statsRow, statsValue, statsVars } from "./styles";
import type { WidgetBlockProps } from "./types";

export function StatsBlock({ stats, size, accent }: WidgetBlockProps) {
  const shown = stats.slice(0, BLOCK_LIMITS.stats[size]);

  return (
    <div data-acc={accent} className={blockBody()}>
      <dl className={statsRow()} style={statsVars(Math.max(1, shown.length))}>
        {shown.map((stat) => {
          const delta = deltaText(stat.delta);
          return (
            <div key={stat.key} className={statCell()}>
              <dt className={statLabel()}>{stat.label}</dt>
              <dd className={statsValue()}>{stat.value}</dd>
              {delta ? <dd className={statDelta()}>{delta}</dd> : null}
            </div>
          );
        })}
      </dl>
    </div>
  );
}
