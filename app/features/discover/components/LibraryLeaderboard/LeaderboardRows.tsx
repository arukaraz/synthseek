"use client";

import { FadeScroll } from "@components/FadeScroll";

import {
  rowCount,
  rowGrid,
  rowName,
  rowNameButton,
  rowProgressFill,
  rowProgressTrack,
  rowFillVars,
  rowRank,
  rowsContainer,
} from "./styles";
import type { LeaderboardRowsProps } from "./types";

export function LeaderboardRows({ entries, maxCount, onSelect }: LeaderboardRowsProps) {
  if (entries.length === 0) return null;

  return (
    <FadeScroll>
      <div className={rowsContainer()}>
        {entries.map((entry, index) => {
          const rank = index + 2;
          const widthPct = maxCount > 0 ? (entry.count / maxCount) * 100 : 0;
          const isLast = index === entries.length - 1;
          return (
            <div key={entry.name} className={rowGrid({ last: isLast })}>
              <span className={rowRank()}>{rank}</span>
              {onSelect ? (
                <button type="button" className={rowNameButton()} onClick={() => onSelect(entry.name)}>
                  {entry.name}
                </button>
              ) : (
                <span className={rowName()}>{entry.name}</span>
              )}
              <div className={rowProgressTrack()}>
                <div className={rowProgressFill()} style={rowFillVars(widthPct, index)} />
              </div>
              <span className={rowCount()}>{entry.count.toLocaleString()}</span>
            </div>
          );
        })}
      </div>
    </FadeScroll>
  );
}
