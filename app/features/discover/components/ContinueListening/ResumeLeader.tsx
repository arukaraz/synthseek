"use client";

import { ListMusic, Pause, Play } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { ProgressBar } from "@components/ui/ProgressBar";
import { formatTrackDuration } from "@utils/formatters";

import { leaderSubtitle, leaderTitle } from "../WidgetLeader/styles";
import { WidgetLeader } from "../WidgetLeader/WidgetLeader";
import { resumeProgress } from "./helpers";
import { resumeLeaderFoot, resumeLeaderProgress, resumeLeaderTime } from "./styles";
import type { ResumeLeaderProps } from "./types";

export function ResumeLeader({ point, fill, onToggle }: ResumeLeaderProps) {
  const { t } = useTranslation("discover");
  const { track } = point;

  return (
    <WidgetLeader
      cover={track.artworkUrl}
      seed={track.id}
      badge={{
        icon: ListMusic,
        label: t("continueListening.queueBadge", { index: point.index + 1, total: point.total }),
      }}
      fill={fill}
    >
      <h3 className={leaderTitle()}>{track.title}</h3>
      <p className={leaderSubtitle()}>{track.artist}</p>
      <div className={resumeLeaderProgress()}>
        <ProgressBar progress={resumeProgress(point)} size="sm" className="bg-overlay-fg/25" />
      </div>
      <div className={resumeLeaderFoot()}>
        <span className={resumeLeaderTime()}>
          {t("continueListening.time", {
            position: formatTrackDuration(point.positionSeconds * 1000),
            duration: formatTrackDuration(track.durationSeconds * 1000),
          })}
        </span>
        <Button size="sm" onClick={onToggle}>
          {point.playing ? <Pause className="size-4" /> : <Play className="size-4" />}
          {point.playing ? t("continueListening.pause") : t("continueListening.resume")}
        </Button>
      </div>
    </WidgetLeader>
  );
}
