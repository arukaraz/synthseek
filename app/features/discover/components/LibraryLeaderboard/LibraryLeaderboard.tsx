"use client";

import { EmptyState } from "@components/ui/EmptyState";
import { useLibrarySummary } from "@hooks/api/queries/useLibrarySummary";
import { fadeIn } from "@utils/animations";
import { motion } from "framer-motion";
import { AlertCircle, Crown, Music } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { TOP_LIMIT } from "./constants";
import { LeaderboardHero } from "./LeaderboardHero";
import { LeaderboardRows } from "./LeaderboardRows";
import { LeaderboardSkeleton } from "./LeaderboardSkeleton";
import { LeaderboardTabs } from "./LeaderboardTabs";
import { LibraryStatsRow } from "./LibraryStatsRow";
import { errorFrame, panelFrame, sectionHeaderLabel, sectionHeaderRow } from "./styles";
import type { LeaderboardEntry, LeaderboardMode } from "./types";

export function LibraryLeaderboard() {
  const { t } = useTranslation("discover");
  const { data, isLoading, isError } = useLibrarySummary();
  const [mode, setMode] = useState<LeaderboardMode>("artists");

  const entries = useMemo<LeaderboardEntry[]>(() => {
    if (!data) return [];
    if (mode === "artists") {
      return data.topArtists.slice(0, TOP_LIMIT).map((row) => ({
        name: row.artist,
        count: row.trackCount,
        image: row.image,
      }));
    }
    return data.topGenres.slice(0, TOP_LIMIT).map((row) => ({
      name: row.genre,
      count: row.albumCount,
      image: row.image,
    }));
  }, [data, mode]);

  if (isLoading) return <LeaderboardSkeleton />;

  if (isError || !data) {
    return (
      <div className={errorFrame()}>
        <EmptyState
          icon={AlertCircle}
          title={t("leaderboard.errorTitle")}
          description={t("leaderboard.errorDescription")}
        />
      </div>
    );
  }

  const totalHours = Math.floor(data.totalDurationMs / (1000 * 60 * 60));
  const summary = {
    tracks: data.completedTracks,
    hours: totalHours,
    queued: data.queuedTracks,
  };
  const top = entries[0];
  const rest = entries.slice(1);
  const maxCount = top?.count ?? 0;

  const emptyIcon = mode === "artists" ? Music : Crown;
  const emptyTitle = mode === "artists" ? t("leaderboard.emptyArtistsTitle") : t("leaderboard.emptyGenresTitle");
  const emptyDescription =
    mode === "artists" ? t("leaderboard.emptyArtistsDescription") : t("leaderboard.emptyGenresDescription");

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className={panelFrame()}>
      <LibraryStatsRow summary={summary} />

      <div className={sectionHeaderRow()}>
        <div className={sectionHeaderLabel()}>
          {mode === "artists" ? t("leaderboard.topArtists") : t("leaderboard.topGenres")}
        </div>
        <LeaderboardTabs mode={mode} onChange={setMode} />
      </div>

      {top ? (
        <>
          <LeaderboardHero entry={top} mode={mode} />
          <LeaderboardRows entries={rest} maxCount={maxCount} />
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center p-6">
          <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
        </div>
      )}
    </motion.div>
  );
}
