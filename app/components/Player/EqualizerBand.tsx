"use client";

import { useTranslation } from "react-i18next";

import { EQUALIZER_MAX_DB, EQUALIZER_MIN_DB, EQUALIZER_STEP_DB } from "@hooks/ui/player/constants";

import { EQUALIZER_PAGE_STEP_DB } from "./constants";
import { bandLabel, formatGainDb, gainDbFromPointer, gainFractionFromTop } from "./helpers";
import {
  bandVars,
  equalizerBand,
  equalizerBandFill,
  equalizerBandHead,
  equalizerBandLabel,
  equalizerBandRail,
  equalizerBandTrack,
  equalizerBandValue,
  equalizerBandZero,
} from "./styles";
import type { PlayerEqualizerBandProps } from "./types";

export function EqualizerBand({ hz, gainDb, disabled, onChange }: PlayerEqualizerBandProps) {
  const { t } = useTranslation("player");
  const label = bandLabel(hz);
  const shown = formatGainDb(gainDb);

  return (
    <div className={equalizerBand({ disabled })}>
      <span className={equalizerBandValue({ active: gainDb !== 0 })}>{shown}</span>
      <div
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={t("equalizer.band", { band: label })}
        aria-orientation="vertical"
        aria-valuemin={EQUALIZER_MIN_DB}
        aria-valuemax={EQUALIZER_MAX_DB}
        aria-valuenow={gainDb}
        aria-valuetext={t("equalizer.gain", { value: shown })}
        aria-disabled={disabled}
        className={equalizerBandTrack()}
        style={bandVars(gainFractionFromTop(gainDb))}
        onPointerDown={(event) => {
          if (disabled) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          onChange(gainDbFromPointer(event.clientY, event.currentTarget.getBoundingClientRect()));
        }}
        onPointerMove={(event) => {
          if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
          onChange(gainDbFromPointer(event.clientY, event.currentTarget.getBoundingClientRect()));
        }}
        onPointerUp={(event) => event.currentTarget.releasePointerCapture(event.pointerId)}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === "ArrowUp" || event.key === "ArrowRight") {
            event.preventDefault();
            onChange(gainDb + EQUALIZER_STEP_DB);
            return;
          }
          if (event.key === "ArrowDown" || event.key === "ArrowLeft") {
            event.preventDefault();
            onChange(gainDb - EQUALIZER_STEP_DB);
            return;
          }
          if (event.key === "PageUp") {
            event.preventDefault();
            onChange(gainDb + EQUALIZER_PAGE_STEP_DB);
            return;
          }
          if (event.key === "PageDown") {
            event.preventDefault();
            onChange(gainDb - EQUALIZER_PAGE_STEP_DB);
            return;
          }
          if (event.key === "Home") {
            event.preventDefault();
            onChange(EQUALIZER_MIN_DB);
            return;
          }
          if (event.key === "End") {
            event.preventDefault();
            onChange(EQUALIZER_MAX_DB);
          }
        }}
      >
        <div className={equalizerBandRail()} />
        <div className={equalizerBandZero()} />
        <div className={equalizerBandFill()} />
        <div className={equalizerBandHead()} />
      </div>
      <span className={equalizerBandLabel()}>{label}</span>
    </div>
  );
}
