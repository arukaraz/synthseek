"use client";

import { ImageWithFallback } from "@components/ui/ImageWithFallback/ImageWithFallback";
import { Crown } from "lucide-react";
import {
  heroContent,
  heroCount,
  heroFrame,
  heroGhostRank,
  heroName,
  heroRankLabel,
  heroThumb,
  heroThumbOverlay,
  heroUnit,
} from "./styles";
import type { LeaderboardHeroProps } from "./types";

export function LeaderboardHero({ entry, mode }: LeaderboardHeroProps) {
  const unitLabel = mode === "artists" ? "tracks" : "albums";

  return (
    <div className={heroFrame()}>
      <div aria-hidden className={heroGhostRank()}>
        01
      </div>

      <div className={heroThumb()}>
        <ImageWithFallback
          src={entry.image}
          alt={entry.name}
          fill
          sizes="72px"
          fallbackIcon={Crown}
          className="object-cover"
        />
        <div className={heroThumbOverlay()} />
        <div className={heroRankLabel()}>#01</div>
      </div>

      <div className={heroContent()}>
        <div className={heroName()}>{entry.name}</div>
        <div className="mt-1.5 flex items-baseline gap-1">
          <span className={heroCount()}>{entry.count.toLocaleString()}</span>
          <span className={heroUnit()}>{unitLabel}</span>
        </div>
      </div>
    </div>
  );
}
