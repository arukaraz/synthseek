"use client";

import { Crown } from "lucide-react";
import { useTranslation } from "react-i18next";

import { leaderRank, leaderSubtitle, leaderTitle } from "../WidgetLeader/styles";
import { WidgetLeader } from "../WidgetLeader/WidgetLeader";
import { formatPlaycount } from "./helpers";
import { heroPlays } from "./styles";
import type { TopTrackHeroProps } from "./types";

export function TopTrackLeader({ track }: TopTrackHeroProps) {
  const { t } = useTranslation("discover");

  return (
    <WidgetLeader
      cover={track.albumImage}
      seed={track.catalogTrackId}
      badge={{ icon: Crown, label: t("topTracks.heroBadge") }}
    >
      <span className={leaderRank()}>1</span>
      <h3 className={leaderTitle()}>{track.title}</h3>
      <p className={leaderSubtitle()}>{track.artist}</p>
      {track.playcount != null ? (
        <p className={heroPlays()}>{t("topTracks.plays", { count: formatPlaycount(track.playcount) })}</p>
      ) : null}
    </WidgetLeader>
  );
}
