"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { AlbumTrackItem } from "./AlbumTrackItem";
import { trackListTrigger } from "../../../styles";
import type { AlbumWithTracks, RequestStatus } from "@api/__generated__/types";

const STATUS_PRIORITY: Record<RequestStatus, number> = {
  importing: 0,
  pending_import: 1,
  downloading: 2,
  pending_download: 3,
  searching: 4,
  in_progress: 5,
  paused: 6,
  queued: 7,
  partially_complete: 8,
  complete: 9,
  failed: 10,
  cancelled: 11,
};

interface AlbumTrackListProps {
  request: AlbumWithTracks;
  expanded: boolean;
  isSingleTrack?: boolean;
  onToggleExpanded: () => void;
  onCancelTrack?: (trackId: string) => void;
  onRetryTrack?: (trackId: string) => void;
}

export function AlbumTrackList({
  request,
  expanded,
  isSingleTrack,
  onToggleExpanded,
  onCancelTrack,
  onRetryTrack,
}: AlbumTrackListProps) {
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
                <AlbumTrackItem
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
