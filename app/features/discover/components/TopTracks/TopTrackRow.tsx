"use client";

import Image from "next/image";

import { tileGradient } from "@features/discover/components/DiscoveryMixes/helpers";

import { formatPlaycount } from "./helpers";
import { item, itemArtist, itemCover, itemMeta, itemPlays, itemRank, itemTitle } from "./styles";
import type { TopTrackRowProps } from "./types";

export function TopTrackRow({ candidate, rank }: TopTrackRowProps) {
  const cover = candidate.albumImage;
  const fallbackBg = tileGradient(candidate.catalogTrackId);

  return (
    <div className={item()}>
      <span className={itemRank()}>{rank}</span>
      <div className={itemCover()}>
        {cover ? (
          <Image src={cover} alt="" fill sizes="42px" className="object-cover" unoptimized />
        ) : (
          <div style={{ background: fallbackBg }} className="size-full" />
        )}
      </div>
      <div className={itemMeta()}>
        <p className={itemTitle()}>{candidate.title}</p>
        <p className={itemArtist()}>{candidate.artist}</p>
      </div>
      {candidate.playcount != null ? <span className={itemPlays()}>{formatPlaycount(candidate.playcount)}</span> : null}
    </div>
  );
}
