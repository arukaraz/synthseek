"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { TrackItem } from "./TrackItem";
import { trackListTrigger } from "../../styles";
import type { RequestStatus, RequestWithTracks } from "@api/__generated__/types";

const STATUS_PRIORITY: Record<RequestStatus, number> = {
  importing: 0,
  pending_import: 1,
  downloading: 2,
  pending_download: 3,
  searching: 4,
  in_progress: 5,
  syncing_plex: 6,
  paused: 7,
  queued: 8,
  partially_complete: 9,
  complete: 10,
  failed: 11,
  cancelled: 12,
};

interface TrackListProps {
  request: RequestWithTracks;
  expanded: boolean;
  isSingleTrack?: boolean;
  onToggleExpanded: () => void;
  onCancelTrack?: (trackId: string) => void;
  onRetryTrack?: (trackId: string) => void;
}

export function TrackList({
  request,
  expanded,
  isSingleTrack,
  onToggleExpanded,
  onCancelTrack,
  onRetryTrack,
}: TrackListProps) {
  const sortedTracks = useMemo(() => {
    return [...request.tracks].sort((a, b) => {
      const priorityA = STATUS_PRIORITY[a.status as RequestStatus] ?? 99;
      const priorityB = STATUS_PRIORITY[b.status as RequestStatus] ?? 99;
      if (priorityA !== priorityB) return priorityA - priorityB;
      return (a.track_number ?? 0) - (b.track_number ?? 0);
    });
  }, [request.tracks]);

  return (
    <div>
      <motion.button className={trackListTrigger()} whileHover={{ x: 2 }} onClick={onToggleExpanded}>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-3.5 w-3.5" />
        </motion.div>
        <span className="font-medium">
          {expanded ? "Hide" : "Show"}
          {!isSingleTrack && ` ${request.total_tracks}`} tracks
        </span>
        <div className="from-fg/10 h-px flex-1 bg-gradient-to-r to-transparent" />
      </motion.button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="custom-scrollbar mt-3 max-h-64 space-y-1 overflow-y-auto pr-1">
              {sortedTracks.map((track, index) => (
                <TrackItem
                  key={track.id}
                  track={track}
                  albumArt={request.album_art}
                  index={index}
                  onCancel={() => onCancelTrack?.(track.id)}
                  onRetry={() => onRetryTrack?.(track.id)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
