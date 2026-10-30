"use client";

import { Crown, Music } from "lucide-react";
import { useTranslation } from "react-i18next";

import { EmptyState } from "@components/ui/EmptyState";

import { LeaderboardHero } from "./LeaderboardHero";
import { LeaderboardRows } from "./LeaderboardRows";
import { LeaderboardTabs } from "./LeaderboardTabs";
import { emptyFrame, rankingFrame, sectionHeaderLabel, sectionHeaderRow } from "./styles";
import type { LeaderboardRankingProps } from "./types";

export function LeaderboardRanking({ mode, entries, compact, onSelect, onModeChange }: LeaderboardRankingProps) {
  const { t } = useTranslation("discover");
  const [top, ...rest] = entries;
  const artists = mode === "artists";

  return (
    <div className={rankingFrame()}>
      <div className={sectionHeaderRow()}>
        {compact ? null : (
          <div className={sectionHeaderLabel()}>
            {artists ? t("leaderboard.topArtists") : t("leaderboard.topGenres")}
          </div>
        )}
        {onModeChange ? <LeaderboardTabs mode={mode} onChange={onModeChange} /> : null}
      </div>

      {top ? (
        <>
          <LeaderboardHero entry={top} mode={mode} onSelect={onSelect} />
          {compact ? null : <LeaderboardRows entries={rest} maxCount={top.count} onSelect={onSelect} />}
        </>
      ) : (
        <div className={emptyFrame()}>
          <EmptyState
            icon={artists ? Music : Crown}
            title={artists ? t("leaderboard.emptyArtistsTitle") : t("leaderboard.emptyGenresTitle")}
            description={artists ? t("leaderboard.emptyArtistsDescription") : t("leaderboard.emptyGenresDescription")}
          />
        </div>
      )}
    </div>
  );
}
