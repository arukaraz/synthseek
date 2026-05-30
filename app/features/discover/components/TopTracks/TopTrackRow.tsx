"use client";

import Image from "next/image";

import { tileGradient } from "@features/discover/components/DiscoveryMixes/helpers";

import { formatPlaycount } from "./helpers";
import { item, itemArtist, itemCover, itemMeta, itemPlays, itemRank, itemTitle } from "./styles";
import type { TopTrackRowProps } from "./types";

export function TopTrackRow({ track, rank }: TopTrackRowProps) {
  const cover = track.albumImage;
  const fallbackBg = tileGradient(track.catalogTrackId);

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
        <p className={itemTitle()}>{track.title}</p>
        <p className={itemArtist()}>{track.artist}</p>
      </div>
      {track.playcount != null ? <span className={itemPlays()}>{formatPlaycount(track.playcount)}</span> : null}
    </div>
  );
}
