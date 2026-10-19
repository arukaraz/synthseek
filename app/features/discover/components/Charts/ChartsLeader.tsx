"use client";

import { Flame } from "lucide-react";
import { useTranslation } from "react-i18next";

import { CoverArt } from "../WidgetRow/CoverArt";
import { ChartAction } from "./ChartAction";
import { chartKey } from "./helpers";
import {
  leader,
  leaderArtist,
  leaderBadge,
  leaderBody,
  leaderCover,
  leaderRank,
  leaderShade,
  leaderTitle,
} from "./styles";
import type { ChartsLeaderProps } from "./types";

export function ChartsLeader({ entry, country }: ChartsLeaderProps) {
  const { t } = useTranslation("discover");

  return (
    <article className={leader()}>
      <span className={leaderCover()}>
        <CoverArt src={entry.track?.album.images[0]?.url ?? null} seed={chartKey(entry)} sizes="280px" />
      </span>
      <span className={leaderShade()} aria-hidden />
      <span className={leaderBadge()}>
        <Flame />
        {t("charts.leaderBadge", { country })}
      </span>
      <div className={leaderBody()}>
        <span className={leaderRank()}>1</span>
        <h3 className={leaderTitle()}>{entry.title}</h3>
        <p className={leaderArtist()}>{entry.artist}</p>
        <ChartAction entry={entry} />
      </div>
    </article>
  );
}
