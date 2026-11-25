"use client";

import { useTranslation } from "react-i18next";

import { Dialog, DialogSurface, DialogTitle } from "@components/ui/Dialog";
import { useMediaQuery } from "@hooks/ui/useMediaQuery";

import { StageClassic } from "./StageClassic";
import { StageImmersive } from "./StageImmersive";
import {
  FULLSCREEN_TOGGLE_SELECTOR,
  OPEN_TRACK_SELECTOR,
  SHORT_LANDSCAPE_QUERY,
  STAGE_IMMERSIVE_QUERY,
  STAGE_WIDE_QUERY,
} from "./constants";
import { returnFocusTo, stageLayout } from "./helpers";
import { srOnly, stage } from "./styles";
import type { PlayerProps } from "./types";

export function PlayerStage({ view, actions }: PlayerProps) {
  const { t } = useTranslation("player");
  const wide = useMediaQuery(STAGE_WIDE_QUERY);
  const short = useMediaQuery(SHORT_LANDSCAPE_QUERY);
  const immersive = useMediaQuery(STAGE_IMMERSIVE_QUERY);
  const layout = stageLayout(wide, short, immersive);

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) actions.toggleFullscreen();
      }}
    >
      <DialogSurface
        className={stage()}
        data-player-stage
        aria-label={t("stage.label")}
        aria-describedby={undefined}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusTo(FULLSCREEN_TOGGLE_SELECTOR, OPEN_TRACK_SELECTOR);
        }}
        onEscapeKeyDown={(event) => {
          if (layout !== "immersive") return;
          if (view.queueOpen) {
            event.preventDefault();
            actions.toggleQueue();
          } else if (view.lyricsOpen) {
            event.preventDefault();
            actions.toggleLyrics();
          }
        }}
      >
        <DialogTitle className={srOnly()}>{view.track.title}</DialogTitle>
        {layout === "immersive" ? (
          <StageImmersive view={view} actions={actions} />
        ) : (
          <StageClassic view={view} actions={actions} layout={layout} />
        )}
      </DialogSurface>
    </Dialog>
  );
}
