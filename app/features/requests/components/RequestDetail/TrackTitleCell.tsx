"use client";

import { RequestStatus, type TrackRequest } from "@api/__generated__/types";
import { cn } from "@utils/cn";

interface TrackTitleCellProps {
  track: TrackRequest;
}

export function TrackTitleCell({ track }: TrackTitleCellProps) {
  return (
    <p
      className={cn(
        "truncate text-sm",
        track.status === RequestStatus.enum.complete
          ? "text-fg/80"
          : track.status === RequestStatus.enum.failed
            ? "text-fg/50"
            : "text-fg/90"
      )}
    >
      {track.title}
    </p>
  );
}
