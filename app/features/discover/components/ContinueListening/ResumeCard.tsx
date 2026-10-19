"use client";

import { Pause, Play } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { ProgressBar } from "@components/ui/ProgressBar";
import { formatTrackDuration } from "@utils/formatters";

import { CoverArt } from "../WidgetRow/CoverArt";
import { resumeProgress } from "./helpers";
import { resumeBody, resumeCard, resumeCover, resumeFoot, resumeMeta, resumeTime, resumeTitle } from "./styles";
import type { ResumeCardProps } from "./types";

export function ResumeCard({ point, onToggle }: ResumeCardProps) {
  const { t } = useTranslation("discover");
  const { track } = point;

  return (
    <div className={resumeCard()}>
      <span className={resumeCover()}>
        <CoverArt src={track.artworkUrl} seed={track.id} sizes="64px" />
      </span>
      <div className={resumeBody()}>
        <span className={resumeTitle()}>{track.title}</span>
        <span className={resumeMeta()}>
          {t("continueListening.position", { artist: track.artist, index: point.index + 1, total: point.total })}
        </span>
        <ProgressBar progress={resumeProgress(point)} size="sm" />
        <div className={resumeFoot()}>
          <span className={resumeTime()}>
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
      </div>
    </div>
  );
}
