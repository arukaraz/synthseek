"use client";

import { Crown } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("discover");
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
          <Crown className="size-3" /> {t("topTracks.heroBadge")}
        </span>
      </div>
      <div className={heroBody()}>
        <div className={heroRank()}>1</div>
        <h3 className={heroTitle()}>{track.title}</h3>
        <p className={heroBy()}>{track.artist}</p>
        {track.playcount != null ? (
          <p className={heroPlays()}>{t("topTracks.plays", { count: formatPlaycount(track.playcount) })}</p>
        ) : null}
      </div>
    </div>
  );
}
