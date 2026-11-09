"use client";

import { cn } from "@utils/cn";
import { SkipForward } from "lucide-react";
import { useTranslation } from "react-i18next";

import { PlayerMoreMenu } from "./PlayerMoreMenu";
import { PlayGlyph } from "./PlayGlyph";
import { TrackCover } from "./TrackCover";
import { labelled, percentOf, trackInitials } from "./helpers";
import {
  barMobileProgressFill,
  iconButton,
  masthead,
  mastheadArtist,
  mastheadIdentity,
  mastheadNext,
  mastheadProgress,
  mastheadText,
  mastheadTitle,
  playButton,
  progressVars,
} from "./styles";
import type { PlayerProps } from "./types";

export function PlayerMasthead({ view, actions }: PlayerProps) {
  const { t } = useTranslation("player");
  const progress = percentOf(view.positionSeconds, view.track.durationSeconds);

  return (
    <div className={masthead()} data-cy="player">
      <button
        type="button"
        className={mastheadIdentity()}
        onClick={actions.toggleFullscreen}
        {...labelled(t("controls.openTrack"))}
        data-player-open-track
      >
        <TrackCover
          initials={trackInitials(view.track.album)}
          tone={view.track.tone}
          size="masthead"
          artworkUrl={view.track.artworkUrl}
        />
        <span className={mastheadText()}>
          <span className={mastheadTitle()}>{view.track.title}</span>
          <span className={mastheadArtist()}>{view.track.artist}</span>
        </span>
      </button>
      <button
        type="button"
        className={playButton({ size: "masthead" })}
        onClick={actions.togglePlay}
        {...labelled(view.playing ? t("controls.pause") : t("controls.play"))}
      >
        <PlayGlyph view={view} spin="size-4" face="size-3.5" />
      </button>
      <button
        type="button"
        className={cn(iconButton(), mastheadNext())}
        onClick={actions.next}
        {...labelled(t("controls.next"))}
      >
        <SkipForward className="size-4 fill-current" />
      </button>
      <PlayerMoreMenu view={view} actions={actions} />
      <div className={mastheadProgress()} style={progressVars(progress)}>
        <div className={barMobileProgressFill()} />
      </div>
    </div>
  );
}
