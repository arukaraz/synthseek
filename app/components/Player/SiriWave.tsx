"use client";

import { useTranslation } from "react-i18next";

import { SEEK_PAGE_SECONDS, SEEK_STEP_SECONDS, WAVE, WAVE_LAYERS, WAVE_LOBES } from "./constants";
import { formatClock, percentOf, secondsFromPointer, waveLobePaths } from "./helpers";
import { waveBaseline, waveHead, waveLayer, waveLobe, waveScrubLabel, waveSvg, waveTrack, waveVars } from "./styles";
import type { PlayerWaveProps } from "./types";

export function SiriWave({ view, actions, size }: PlayerWaveProps) {
  const { t } = useTranslation("player");
  const paths = waveLobePaths(view.track.id);
  const duration = view.track.durationSeconds;
  const progress = percentOf(view.positionSeconds, duration);
  const scrub = view.scrubSeconds === null ? null : percentOf(view.scrubSeconds, duration);

  const clampedSeek = (seconds: number) => {
    actions.seekTo(Math.min(duration, Math.max(0, seconds)));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = event.key === "PageUp" || event.key === "PageDown" ? SEEK_PAGE_SECONDS : SEEK_STEP_SECONDS;
    if (event.key === "ArrowRight" || event.key === "PageUp") {
      event.preventDefault();
      clampedSeek(view.positionSeconds + step);
      return;
    }
    if (event.key === "ArrowLeft" || event.key === "PageDown") {
      event.preventDefault();
      clampedSeek(view.positionSeconds - step);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      clampedSeek(0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      clampedSeek(duration);
    }
  };

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={t("controls.seek")}
      aria-valuemin={0}
      aria-valuemax={Math.round(duration)}
      aria-valuenow={Math.round(view.positionSeconds)}
      aria-valuetext={formatClock(view.positionSeconds)}
      className={waveTrack({ size })}
      style={waveVars(progress, scrub, view.playing && !view.loading)}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        clampedSeek(secondsFromPointer(event.clientX, event.currentTarget.getBoundingClientRect(), duration));
      }}
      onPointerMove={(event) => {
        const seconds = secondsFromPointer(event.clientX, event.currentTarget.getBoundingClientRect(), duration);
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          clampedSeek(seconds);
          return;
        }
        actions.scrubTo(seconds);
      }}
      onPointerUp={(event) => {
        event.currentTarget.releasePointerCapture(event.pointerId);
        actions.scrubTo(null);
      }}
      onPointerLeave={() => actions.scrubTo(null)}
      onKeyDown={handleKeyDown}
    >
      {WAVE_LAYERS.map((state) => (
        <div key={state} className={waveLayer({ state })}>
          <svg
            className={waveSvg()}
            viewBox={`0 0 ${WAVE.VIEWBOX_WIDTH} ${WAVE.VIEWBOX_HEIGHT}`}
            preserveAspectRatio="none"
            aria-hidden
          >
            {paths.map((path, index) => (
              <path
                key={WAVE_LOBES[index] ?? index}
                className={waveLobe({ lobe: WAVE_LOBES[index] ?? "a" })}
                d={path}
              />
            ))}
          </svg>
        </div>
      ))}
      <div className={waveBaseline()} />
      <div className={waveHead({ size })} />
      {view.scrubSeconds === null ? null : (
        <span className={waveScrubLabel({ size })}>{formatClock(view.scrubSeconds)}</span>
      )}
    </div>
  );
}
