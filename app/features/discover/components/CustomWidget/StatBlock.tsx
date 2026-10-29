"use client";

import { deltaText } from "./helpers";
import { blockBody, statBody, statDelta, statLabel, statValue } from "./styles";
import type { WidgetBlockProps } from "./types";

export function StatBlock({ stats, size, accent }: WidgetBlockProps) {
  const [stat] = stats;
  if (!stat) return null;
  const delta = size === "S" ? null : deltaText(stat.delta);

  return (
    <div data-acc={accent} className={blockBody()}>
      <div className={statBody()}>
        <span className={statValue()}>{stat.value}</span>
        <span className={statLabel()}>{stat.label}</span>
      </div>
      {delta ? <span className={statDelta()}>{delta}</span> : null}
    </div>
  );
}
