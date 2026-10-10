"use client";

import { cn } from "@utils/cn";
import {
  Info,
  MoreVertical,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Square,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { PlayGlyph } from "./PlayGlyph";
import { PlayerVolume } from "./PlayerVolume";
import { StageActions } from "./StageActions";
import { StageDrawer } from "./StageDrawer";
import { labelled } from "./helpers";
import {
  iconButton,
  moreBadge,
  playButton,
  stageArea,
  stageController,
  stageCorner,
  stagePad,
  stageRing,
  stageRingSlot,
  stageTray,
} from "./styles";
import type { StageControllerProps } from "./types";
import { useMoreAttention } from "./useMoreAttention";

export function StageController({ view, actions, drawer, onToggle }: StageControllerProps) {
  const { t } = useTranslation("player");
  const more = useMoreAttention(view);
  const infoName = view.chain.transcoding
    ? `${t("controls.info")}: ${t("chain.serverConverting")}`
    : t("controls.info");

  return (
    <div className={stageController()}>
      <div className={stagePad()}>
        <button
          type="button"
          className={cn(stageCorner({ active: drawer === "info" }), stageArea({ area: "info" }))}
          onClick={() => onToggle("info")}
          aria-expanded={drawer === "info"}
          {...labelled(infoName)}
        >
          <Info className="size-5" />
          {view.chain.transcoding ? <span className={cn(moreBadge({ tone: "notice" }), "top-1.5 right-1.5")} /> : null}
        </button>
        <button
          type="button"
          className={cn(stageCorner({ active: view.shuffle }), stageArea({ area: "shuffle" }))}
          onClick={actions.toggleShuffle}
          {...labelled(t("controls.shuffle"))}
          aria-pressed={view.shuffle}
        >
          <Shuffle className="size-4.5" />
        </button>
        <div className={stageRing()}>
          <button
            type="button"
            className={cn(iconButton({ size: "stage" }), stageRingSlot({ at: "top" }))}
            onClick={actions.stop}
            disabled={view.stopped}
            {...labelled(t("controls.stop"))}
          >
            <Square className="size-4 fill-current" />
          </button>
          <button
            type="button"
            className={cn(iconButton({ size: "stage" }), stageRingSlot({ at: "left" }))}
            onClick={actions.previous}
            {...labelled(t("controls.previous"))}
          >
            <SkipBack className="size-5 fill-current" />
          </button>
          <button
            type="button"
            className={cn(playButton({ size: "ring" }), stageRingSlot({ at: "center" }))}
            onClick={actions.togglePlay}
            {...labelled(view.playing ? t("controls.pause") : t("controls.play"))}
          >
            <PlayGlyph view={view} spin="size-5" face="size-5" />
          </button>
          <button
            type="button"
            className={cn(iconButton({ size: "stage" }), stageRingSlot({ at: "right" }))}
            onClick={actions.next}
            {...labelled(t("controls.next"))}
          >
            <SkipForward className="size-5 fill-current" />
          </button>
          <button
            type="button"
            className={cn(
              iconButton({ tone: drawer === "volume" ? "active" : "muted", size: "stage" }),
              stageRingSlot({ at: "bottom" })
            )}
            onClick={() => onToggle("volume")}
            aria-expanded={drawer === "volume"}
            {...labelled(t("controls.volumeControls"))}
          >
            {view.muted ? <VolumeX className="size-4.5" /> : <Volume2 className="size-4.5" />}
          </button>
        </div>
        <div className={stageArea({ area: "volume" })}>
          <StageDrawer open={drawer === "volume"}>
            <div className={stageTray({ edge: "bottom" })}>
              <PlayerVolume view={view} actions={actions} size="drawer" />
            </div>
          </StageDrawer>
        </div>
        <button
          type="button"
          className={cn(stageCorner({ active: drawer === "actions" }), stageArea({ area: "more" }))}
          onClick={() => onToggle("actions")}
          aria-expanded={drawer === "actions"}
          {...labelled(more.name)}
        >
          <MoreVertical className="size-5" />
          {more.attention === null ? null : (
            <span className={cn(moreBadge({ tone: more.attention }), "top-1.5 right-1.5")} />
          )}
        </button>
        <div className={stageArea({ area: "actions" })}>
          <StageDrawer open={drawer === "actions"}>
            <div className={stageTray({ edge: "top" })}>
              <StageActions view={view} actions={actions} />
            </div>
          </StageDrawer>
        </div>
        <button
          type="button"
          className={cn(stageCorner({ active: view.repeat !== "off" }), stageArea({ area: "repeat" }))}
          onClick={actions.cycleRepeat}
          {...labelled(t(`controls.repeat.${view.repeat}`))}
        >
          {view.repeat === "one" ? <Repeat1 className="size-4.5" /> : <Repeat className="size-4.5" />}
        </button>
      </div>
    </div>
  );
}
