"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";

import { artworkProxySrc } from "@utils/artworkProxy";

import { tileGradient } from "../DiscoveryMixes/helpers";
import { weekArtist, weekCopy, weekCover, weekPlays, weekRank, weekRow, weekTitle } from "./styles";
import type { LastYearRowProps } from "./types";

export function LastYearRow({ track, rank }: LastYearRowProps) {
  const { t } = useTranslation("discover");

  return (
    <li className={weekRow()}>
      <span className={weekRank()}>{rank}</span>
      <span className={weekCover()}>
        {track.cover ? (
          <Image src={artworkProxySrc(track.cover)} alt="" fill sizes="40px" className="object-cover" unoptimized />
        ) : (
          <span style={{ background: tileGradient(track.trackId) }} className="absolute inset-0" />
        )}
      </span>
      <span className={weekCopy()}>
        <span className={weekTitle()}>{track.title}</span>
        <span className={weekArtist()}>{track.artist}</span>
      </span>
      <span className={weekPlays()}>{t("lastYear.plays", { count: track.plays })}</span>
    </li>
  );
}
