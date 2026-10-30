"use client";

import { EmptyState } from "@components/ui/EmptyState";
import { WidgetHeader } from "@components/WidgetHeader";
import { useLibrarySummary } from "@hooks/api/queries/useLibrarySummary";
import { useResolveArtistAndOpen } from "@hooks/ui/useResolveArtistAndOpen";
import { fadeIn } from "@utils/animations";
import { motion } from "framer-motion";
import { AlertCircle, Library } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { BoardWidgetProps } from "../ExploreBoard/types";
import { TAB_MODES } from "./constants";
import { leaderboardEntries } from "./helpers";
import { LeaderboardRanking } from "./LeaderboardRanking";
import { LeaderboardSkeleton } from "./LeaderboardSkeleton";
import { LibraryStatsRow } from "./LibraryStatsRow";
import { errorFrame, headerBlock, panelFrame, rankingColumns } from "./styles";
import type { LeaderboardMode } from "./types";

export function LibraryLeaderboard({ size, info }: BoardWidgetProps) {
  const { t } = useTranslation("discover");
  const { data, isLoading, isError } = useLibrarySummary();
  const [mode, setMode] = useState<LeaderboardMode>("artists");
  const openArtistByName = useResolveArtistAndOpen();

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
  const selectFor = (ranked: LeaderboardMode) => (ranked === "artists" ? openArtistByName : undefined);

  return (
    <motion.section
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className={panelFrame()}
      aria-labelledby="library-leaderboard-heading"
    >
      <div className={headerBlock()}>
        <WidgetHeader
          icon={Library}
          title={t("leaderboard.title")}
          subtitle={t("leaderboard.subtitle")}
          titleId="library-leaderboard-heading"
          info={info}
        />
      </div>
      <LibraryStatsRow summary={summary} />

      {size === "L" ? (
        <div className={rankingColumns()}>
          {TAB_MODES.map((ranked) => (
            <LeaderboardRanking
              key={ranked}
              mode={ranked}
              entries={leaderboardEntries(data, ranked)}
              compact={false}
              onSelect={selectFor(ranked)}
            />
          ))}
        </div>
      ) : (
        <LeaderboardRanking
          mode={mode}
          entries={leaderboardEntries(data, mode)}
          compact={size === "S"}
          onSelect={selectFor(mode)}
          onModeChange={setMode}
        />
      )}
    </motion.section>
  );
}
