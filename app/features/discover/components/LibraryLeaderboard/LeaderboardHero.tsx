"use client";

import { ImageWithFallback } from "@components/ImageWithFallback/ImageWithFallback";
import { Crown } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  heroContent,
  heroCount,
  heroFrame,
  heroGhostRank,
  heroName,
  heroNameButton,
  heroRankLabel,
  heroThumb,
  heroThumbOverlay,
  heroUnit,
} from "./styles";
import type { LeaderboardHeroProps } from "./types";

export function LeaderboardHero({ entry, mode, onSelect }: LeaderboardHeroProps) {
  const { t } = useTranslation("discover");
  const unitLabel = mode === "artists" ? t("leaderboard.unitTracks") : t("leaderboard.unitAlbums");

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
        {onSelect ? (
          <button type="button" className={heroNameButton()} onClick={() => onSelect(entry.name)}>
            {entry.name}
          </button>
        ) : (
          <div className={heroName()}>{entry.name}</div>
        )}
        <div className="mt-1.5 flex items-baseline gap-1">
          <span className={heroCount()}>{entry.count.toLocaleString()}</span>
          <span className={heroUnit()}>{unitLabel}</span>
        </div>
      </div>
    </div>
  );
}
