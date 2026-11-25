import Image from "next/image";

import { artworkImage } from "@utils/artworkProxy";
import { cn } from "@utils/cn";

import { cover, coverArtwork, coverDepth, coverGlow, coverInitials } from "./styles";
import type { PlayerCoverProps } from "./types";

export function TrackCover({ initials, tone, size, artworkUrl = null }: PlayerCoverProps) {
  const large = size === "immersive" || size === "immersiveSide" || size === "immersiveIdle";
  return (
    <div
      className={cn(
        cover({ tone, size }),
        large ? coverDepth() : size === "stage" || size === "fluid" ? coverGlow({ tone }) : undefined
      )}
    >
      {artworkUrl === null ? (
        <span className={coverInitials({ size })} aria-hidden>
          {initials}
        </span>
      ) : (
        <Image className={coverArtwork()} {...artworkImage(artworkUrl)} alt="" fill sizes={large ? "34rem" : "256px"} />
      )}
    </div>
  );
}
