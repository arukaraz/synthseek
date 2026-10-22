"use client";

import { Flame } from "lucide-react";
import { useTranslation } from "react-i18next";

import { leaderRank, leaderSubtitle, leaderTitle } from "../WidgetLeader/styles";
import { WidgetLeader } from "../WidgetLeader/WidgetLeader";
import { ChartAction } from "./ChartAction";
import { chartKey } from "./helpers";
import type { ChartsLeaderProps } from "./types";

export function ChartsLeader({ entry, country }: ChartsLeaderProps) {
  const { t } = useTranslation("discover");

  return (
    <WidgetLeader
      cover={entry.track?.album.images[0]?.url ?? null}
      seed={chartKey(entry)}
      badge={{ icon: Flame, label: t("charts.leaderBadge", { country }) }}
    >
      <span className={leaderRank()}>1</span>
      <h3 className={leaderTitle()}>{entry.title}</h3>
      <p className={leaderSubtitle()}>{entry.artist}</p>
      <ChartAction entry={entry} />
    </WidgetLeader>
  );
}
