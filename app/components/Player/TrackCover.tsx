import { cn } from "@utils/cn";

import { cover, coverGlow, coverInitials } from "./styles";
import type { PlayerCoverProps } from "./types";

export function TrackCover({ initials, tone, size }: PlayerCoverProps) {
  return (
    <div className={cn(cover({ tone, size }), size === "stage" ? coverGlow({ tone }) : undefined)} aria-hidden>
      <span className={coverInitials({ size })}>{initials}</span>
    </div>
  );
}
