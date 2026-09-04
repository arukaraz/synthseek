import Image from "next/image";

import { cn } from "@utils/cn";

import { cover, coverArtwork, coverGlow, coverInitials } from "./styles";
import type { PlayerCoverProps } from "./types";

export function TrackCover({ initials, tone, size, artworkUrl = null }: PlayerCoverProps) {
  return (
    <div className={cn(cover({ tone, size }), size === "stage" ? coverGlow({ tone }) : undefined)}>
      {artworkUrl === null ? (
        <span className={coverInitials({ size })} aria-hidden>
          {initials}
        </span>
      ) : (
        <Image className={coverArtwork()} src={artworkUrl} alt="" fill sizes="256px" />
      )}
    </div>
  );
}
