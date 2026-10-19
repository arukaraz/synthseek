"use client";

import {
  rowCount,
  rowGrid,
  rowName,
  rowNameButton,
  rowProgressFill,
  rowProgressTrack,
  rowRank,
  rowsContainer,
} from "./styles";
import type { LeaderboardRowsProps } from "./types";

export function LeaderboardRows({ entries, maxCount, onSelect }: LeaderboardRowsProps) {
  if (entries.length === 0) return null;

  return (
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
              <div
                className={rowProgressFill()}
                style={{ width: `${widthPct}%`, opacity: Math.max(0.45, 1 - index * 0.12) }}
              />
            </div>
            <span className={rowCount()}>{entry.count.toLocaleString()}</span>
          </div>
        );
      })}
    </div>
  );
}
