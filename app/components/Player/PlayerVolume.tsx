"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useTranslation } from "react-i18next";

import { VOLUME_STEP } from "./constants";
import { fractionFromPointer, labelled } from "./helpers";
import { iconButton, volumeFill, volumeGroup, volumeHead, volumeRail, volumeTrack, volumeVars } from "./styles";
import type { PlayerVolumeProps } from "./types";

export function PlayerVolume({ view, actions, size }: PlayerVolumeProps) {
  const { t } = useTranslation("player");
  const percent = (view.muted ? 0 : view.volume) * 100;

  return (
    <div className={volumeGroup({ size })}>
      <button
        type="button"
        className={iconButton({ size: size === "stage" ? "stage" : undefined })}
        onClick={actions.toggleMute}
        {...labelled(view.muted ? t("controls.unmute") : t("controls.mute"))}
      >
        {view.muted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
      </button>
      <div
        role="slider"
        tabIndex={0}
        aria-label={t("controls.volume")}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
        aria-valuetext={`${Math.round(percent)}%`}
        className={volumeTrack({ size })}
        style={volumeVars(percent)}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          actions.setVolume(fractionFromPointer(event.clientX, event.currentTarget.getBoundingClientRect()));
        }}
        onPointerMove={(event) => {
          if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
          actions.setVolume(fractionFromPointer(event.clientX, event.currentTarget.getBoundingClientRect()));
        }}
        onPointerUp={(event) => event.currentTarget.releasePointerCapture(event.pointerId)}
        onKeyDown={(event) => {
          const current = view.muted ? 0 : view.volume;
          if (event.key === "ArrowRight" || event.key === "PageUp") {
            event.preventDefault();
            actions.setVolume(current + VOLUME_STEP);
            return;
          }
          if (event.key === "ArrowLeft" || event.key === "PageDown") {
            event.preventDefault();
            actions.setVolume(current - VOLUME_STEP);
            return;
          }
          if (event.key === "Home") {
            event.preventDefault();
            actions.setVolume(0);
            return;
          }
          if (event.key === "End") {
            event.preventDefault();
            actions.setVolume(1);
          }
        }}
      >
        <div className={volumeRail()}>
          <div className={volumeFill()} />
          <div className={volumeHead()} />
        </div>
      </div>
    </div>
  );
}
