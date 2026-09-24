"use client";

import { useTranslation } from "react-i18next";

import { SETTINGS_SLIDER_PAGE_STEPS } from "./constants";
import { formatWithUnit, steppedInRange, valueFromHorizontalPointer } from "./helpers";
import {
  settingsSlider,
  settingsSliderLabel,
  settingsSliderTrack,
  settingsSliderValue,
  volumeFill,
  volumeHead,
  volumeRail,
  volumeVars,
} from "./styles";
import type { PlayerSettingsSliderProps } from "./types";

export function SettingsSlider({
  label,
  value,
  min,
  max,
  step,
  unit,
  disabled = false,
  onChange,
  onCommit,
}: PlayerSettingsSliderProps) {
  const { t } = useTranslation("player");
  const shown = formatWithUnit(value, unit, t(`settings.units.${unit}`));
  const percent = max > min ? ((value - min) / (max - min)) * 100 : 0;
  const settle = (next: number, commit: boolean) => {
    const stepped = steppedInRange(next, min, max, step);
    onChange(stepped);
    if (commit) onCommit?.(stepped);
  };

  return (
    <div className={settingsSlider()}>
      <span className={settingsSliderLabel()}>{label}</span>
      <div
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={shown}
        aria-disabled={disabled}
        className={settingsSliderTrack()}
        style={volumeVars(percent)}
        onPointerDown={(event) => {
          if (disabled) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          settle(
            valueFromHorizontalPointer(event.clientX, event.currentTarget.getBoundingClientRect(), min, max, step),
            false
          );
        }}
        onPointerMove={(event) => {
          if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
          settle(
            valueFromHorizontalPointer(event.clientX, event.currentTarget.getBoundingClientRect(), min, max, step),
            false
          );
        }}
        onPointerUp={(event) => {
          if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
          event.currentTarget.releasePointerCapture(event.pointerId);
          settle(
            valueFromHorizontalPointer(event.clientX, event.currentTarget.getBoundingClientRect(), min, max, step),
            true
          );
        }}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === "ArrowRight" || event.key === "ArrowUp") {
            event.preventDefault();
            settle(value + step, true);
            return;
          }
          if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
            event.preventDefault();
            settle(value - step, true);
            return;
          }
          if (event.key === "PageUp") {
            event.preventDefault();
            settle(value + step * SETTINGS_SLIDER_PAGE_STEPS, true);
            return;
          }
          if (event.key === "PageDown") {
            event.preventDefault();
            settle(value - step * SETTINGS_SLIDER_PAGE_STEPS, true);
            return;
          }
          if (event.key === "Home") {
            event.preventDefault();
            settle(min, true);
            return;
          }
          if (event.key === "End") {
            event.preventDefault();
            settle(max, true);
          }
        }}
      >
        <div className={volumeRail()}>
          <div className={volumeFill()} />
          <div className={volumeHead()} />
        </div>
      </div>
      <span className={settingsSliderValue()}>{shown}</span>
    </div>
  );
}
