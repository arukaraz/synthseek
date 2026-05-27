"use client";

import { EmptyState } from "@components/ui/EmptyState";
import { useLibrarySummary } from "@hooks/api/queries/useLibrarySummary";
import { fadeIn } from "@utils/animations";
import { motion } from "framer-motion";
import { AlertCircle, Crown, Music } from "lucide-react";
import { useMemo, useState } from "react";
import { LeaderboardHero } from "./LeaderboardHero";
import { LeaderboardRows } from "./LeaderboardRows";
import { LeaderboardTabs } from "./LeaderboardTabs";
import { LibraryStatsRow } from "./LibraryStatsRow";
import { errorFrame, panelFrame, sectionHeaderLabel, sectionHeaderRow, skeletonFrame } from "./styles";
import type { LeaderboardEntry, LeaderboardMode } from "./types";

const TOP_LIMIT = 5;

function LeaderboardSkeleton() {
  return (
    <div className={skeletonFrame()}>
      <div className="border-fg/10 grid grid-cols-3 border-b">
        {[1, 2, 3].map((i) => (
          <div key={i} className="py-3 text-center">
            <div className="bg-fg/10 mx-auto h-5 w-10 rounded" />
            <div className="bg-fg/10 mx-auto mt-1.5 h-2.5 w-14 rounded" />
          </div>
        ))}
      </div>
      <div className={sectionHeaderRow()}>
        <div className="bg-fg/10 h-3 w-24 rounded" />
        <div className="bg-fg/10 h-6 w-32 rounded" />
      </div>
      <div className="border-fg/10 border-b p-3">
        <div className="bg-fg/10 h-16 w-full rounded" />
      </div>
      <div className="space-y-2 px-4 py-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-fg/10 h-4 w-full rounded" />
        ))}
      </div>
    </div>
  );
}

export function LibraryLeaderboard() {
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
          title="Failed to load library"
          description="Unable to fetch library statistics. Please try again."
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
  const emptyTitle = mode === "artists" ? "No artists yet" : "No genres yet";
  const emptyDescription =
    mode === "artists"
      ? "Complete some downloads to see your top artists."
      : "Genres are tracked on new downloads — they will populate as your library grows.";

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className={panelFrame()}>
      <LibraryStatsRow summary={summary} />

      <div className={sectionHeaderRow()}>
        <div className={sectionHeaderLabel()}>Top {mode}</div>
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
