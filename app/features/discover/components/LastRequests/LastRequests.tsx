"use client";

import { EmptyState } from "@components/ui/EmptyState";
import type { FlatTrackRow } from "@features/requests/types";
import { useTrackRequests } from "@hooks/api";
import { gradientOverlay } from "@theme/utilities/styles";
import { fadeIn } from "@utils/animations";
import { motion } from "framer-motion";
import { AlertCircle, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { LastRequestItem } from "./LastRequestItem";
import { LastRequestsSkeleton } from "./LastRequestsSkeleton";

const RECENT_REQUESTS_LIMIT = 15;

export function LastRequests() {
  const router = useRouter();
  const { data: items, isLoading, isError } = useTrackRequests();

  const recentRequests = useMemo<FlatTrackRow[]>(() => {
    if (!items) return [];

    const flat: FlatTrackRow[] = items.flatMap((item) =>
      item.tracks.map((track) => ({
        ...track,
        parent: {
          id: item.id,
          name: item.name,
          artist: item.artist,
          album_art: item.album_art,
          contentType: item.contentType,
          requestedBy: item.requestedBy,
        },
      }))
    );

    return flat
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, RECENT_REQUESTS_LIMIT);
  }, [items]);

  const handleSeeMore = () => {
    router.push("/requests");
  };

  if (isLoading) {
    return <LastRequestsSkeleton />;
  }

  if (isError) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Failed to load requests"
        description="Unable to fetch recent requests. Please try again."
      />
    );
  }

  if (recentRequests.length === 0) {
    return (
      <EmptyState
        icon={Download}
        title="No requests yet"
        description="Start requesting music to see your recent downloads here"
      />
    );
  }

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="relative flex h-full flex-col rounded-xl p-4"
    >
      <div className={gradientOverlay({ direction: "toR", intensity: "subtle" })} />

      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="mb-4 flex shrink-0 items-center justify-between">
          <div>
            <h3 className="text-fg text-lg font-semibold">Last Requests</h3>
            <p className="text-fg/60 text-xs">{`Your last ${RECENT_REQUESTS_LIMIT} downloads`}</p>
          </div>
          <button
            onClick={handleSeeMore}
            aria-label="View all requests"
            className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
          >
            See more →
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
          {recentRequests.map((request, index) => (
            <LastRequestItem key={request.id} request={request} index={index} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
