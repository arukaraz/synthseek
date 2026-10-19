"use client";

import { useTranslation } from "react-i18next";

import { TAB_MODES } from "./constants";
import { tabActive, tabInactive, tabsContainer } from "./styles";
import type { LeaderboardMode, LeaderboardTabsProps } from "./types";

export function LeaderboardTabs({ mode, onChange }: LeaderboardTabsProps) {
  const { t } = useTranslation("settings");

  const labelFor = (tabMode: LeaderboardMode) =>
    tabMode === "artists" ? t("overview.leaderboard.tabArtists") : t("overview.leaderboard.tabGenres");

  return (
    <div role="tablist" aria-label={t("overview.leaderboard.tabsAriaLabel")} className={tabsContainer()}>
      {TAB_MODES.map((tabMode) => {
        const active = tabMode === mode;
        return (
          <button
            key={tabMode}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(tabMode)}
            className={active ? tabActive() : tabInactive()}
          >
            {labelFor(tabMode)}
          </button>
        );
      })}
    </div>
  );
}
