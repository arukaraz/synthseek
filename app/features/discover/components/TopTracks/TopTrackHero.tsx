"use client";

import { Crown } from "lucide-react";
import Image from "next/image";

import { tileGradient } from "@features/discover/components/DiscoveryMixes/helpers";

import { formatPlaycount } from "./helpers";
import {
  hero,
  heroBody,
  heroBy,
  heroCrown,
  heroFallback,
  heroImage,
  heroPlays,
  heroRank,
  heroShade,
  heroTitle,
  heroTop,
} from "./styles";
import type { TopTrackHeroProps } from "./types";

export function TopTrackHero({ track }: TopTrackHeroProps) {
  const cover = track.albumImage;
  const fallbackBg = tileGradient(track.catalogTrackId);

  return (
    <div className={hero()}>
      {cover ? (
        <Image src={cover} alt="" fill sizes="240px" className={heroImage()} unoptimized />
      ) : (
        <div style={{ background: fallbackBg }} className={heroFallback()} />
      )}
      <span className={heroShade()} aria-hidden />
      <div className={heroTop()}>
        <span className={heroCrown()}>
          <Crown className="size-3" /> #1 most played
        </span>
      </div>
      <div className={heroBody()}>
        <div className={heroRank()}>1</div>
        <h3 className={heroTitle()}>{track.title}</h3>
        <p className={heroBy()}>{track.artist}</p>
        {track.playcount != null ? <p className={heroPlays()}>{formatPlaycount(track.playcount)} plays</p> : null}
      </div>
    </div>
  );
}
