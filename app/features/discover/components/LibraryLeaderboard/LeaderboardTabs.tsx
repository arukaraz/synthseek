"use client";

import { OPTIONS } from "./constants";
import { tabActive, tabInactive, tabsContainer } from "./styles";
import type { LeaderboardTabsProps } from "./types";

export function LeaderboardTabs({ mode, onChange }: LeaderboardTabsProps) {
  return (
    <div role="tablist" aria-label="Library leaderboard mode" className={tabsContainer()}>
      {OPTIONS.map((option) => {
        const active = option.id === mode;
        return (
          <button
            key={option.id}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(option.id)}
            className={active ? tabActive() : tabInactive()}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
