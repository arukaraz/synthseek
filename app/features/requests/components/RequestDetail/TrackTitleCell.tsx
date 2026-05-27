"use client";

import { RequestStatus } from "@api/__generated__/types";
import { cn } from "@utils/cn";
import type { TrackTitleCellProps } from "./types";

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
