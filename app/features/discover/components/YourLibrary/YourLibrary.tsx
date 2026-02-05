"use client";

import { EmptyState } from "@components/ui/EmptyState";
import { useLibrarySummary } from "@hooks/api/queries/useLibrarySummary";
import { gradientOverlay } from "@theme/utilities/styles";
import { fadeIn } from "@utils/animations";
import { motion } from "framer-motion";
import { AlertCircle, Clock, Library, ListMusic } from "lucide-react";
import { glassPanelCard } from "../styles";
import { StatCard } from "./StatCard";
import { TopArtistsList } from "./TopArtistsList";

function YourLibrarySkeleton() {
  return (
    <div className={glassPanelCard({ width: "full" })}>
      <div className={gradientOverlay({ direction: "linearToR", intensity: "subtle" })} />

      <div className="relative flex flex-1 flex-col">
        <div className="mb-4 space-y-2">
          <div className="bg-fg/10 h-5 w-28 animate-pulse rounded" />
          <div className="bg-fg/10 h-3 w-36 animate-pulse rounded" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-fg/5 h-20 animate-pulse rounded-lg" />
          ))}
        </div>

        <div className="mt-4 border-t border-white/10 pt-4">
          <div className="bg-fg/10 mb-2 h-3 w-24 animate-pulse rounded" />
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-fg/10 h-4 animate-pulse rounded" />
            ))}
          </div>
        </div>

        <div className="mt-auto pt-4">
          <div className="bg-fg/10 mx-auto h-4 w-48 animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}

export function YourLibrary() {
  const { data, isLoading, isError } = useLibrarySummary();

  if (isLoading) {
    return <YourLibrarySkeleton />;
  }

  if (isError) {
    return (
      <div className={glassPanelCard({ width: "full" })}>
        <div className={gradientOverlay({ direction: "linearToR", intensity: "subtle" })} />
        <div className="relative flex flex-1 items-center justify-center">
          <EmptyState
            icon={AlertCircle}
            title="Failed to load library"
            description="Unable to fetch library statistics. Please try again."
          />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={glassPanelCard({ width: "full" })}>
        <div className={gradientOverlay({ direction: "linearToR", intensity: "subtle" })} />
        <div className="relative flex flex-1 items-center justify-center">
          <EmptyState
            icon={Library}
            title="No library data"
            description="Start downloading music to see your library stats."
          />
        </div>
      </div>
    );
  }

  const totalHours = Math.floor(data.totalDurationMs / (1000 * 60 * 60));

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className={glassPanelCard({ width: "full" })}>
      <div className={gradientOverlay({ direction: "linearToR", intensity: "subtle" })} />

      <div className="relative flex flex-1 flex-col">
        <div className="mb-4">
          <h3 className="text-fg text-lg font-semibold">Your Library</h3>
          <p className="text-fg/60 text-xs">Track your collection</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatCard value={data.completedTracks} label="Tracks" sublabel="Done" icon={ListMusic} />
          <StatCard value={totalHours} label="Hours" sublabel="Listening" icon={Clock} />
          <StatCard value={data.queuedTracks} label="In Queue" sublabel="Requests" icon={ListMusic} />
        </div>

        <TopArtistsList artists={data.topArtists} />
      </div>
    </motion.div>
  );
}
