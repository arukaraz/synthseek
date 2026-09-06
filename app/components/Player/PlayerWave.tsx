"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { audioEnergy } from "@hooks/ui/player/energy";

import {
  ENERGY_ATTACK_MS,
  ENERGY_RELEASE_MS,
  FRAME_CEILING_MS,
  PROGRESS_FOLLOW_MS,
  PROGRESS_SNAP_FRACTION,
  REDUCED_MOTION_QUERY,
  SEEK_PAGE_SECONDS,
  SEEK_STEP_SECONDS,
  SETTLE_EPSILON,
  WAVE,
} from "./constants";
import { followed, formatClock, fractionOf, paintWave, secondsFromPointer, waveColors, wavePhase } from "./helpers";
import { waveCanvas, waveTrack } from "./styles";
import type { PlayerWaveProps, WaveColors, WaveSnapshot } from "./types";

export function PlayerWave({ view, actions, size }: PlayerWaveProps) {
  const { t } = useTranslation("player");
  const [dragging, setDragging] = useState(false);
  const wakeRef = useRef<(() => void) | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const colorsRef = useRef<WaveColors | null>(null);
  const probedThemeRef = useRef<string | null>(null);
  const snapshotRef = useRef<WaveSnapshot | null>(null);
  const originRef = useRef<number | null>(null);
  const shownRef = useRef(0);
  const energyRef = useRef(1);
  const elapsedRef = useRef(0);
  const trackIdRef = useRef(view.track.id);

  const duration = view.track.durationSeconds;
  const played = fractionOf(view.positionSeconds, duration);
  const scrubbed = view.scrubSeconds === null ? null : fractionOf(view.scrubSeconds, duration);
  const target = dragging && scrubbed !== null ? scrubbed : played;
  const announced = dragging && view.scrubSeconds !== null ? view.scrubSeconds : view.positionSeconds;

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

  useEffect(() => {
    if (trackIdRef.current !== view.track.id) {
      trackIdRef.current = view.track.id;
      shownRef.current = target;
    }
    snapshotRef.current = {
      phase: wavePhase(view.track.id),
      progress: target,
      origin: originRef.current,
      hover: dragging ? null : scrubbed,
      dragging,
      playing: view.playing,
      loading: view.loading,
      label: formatClock(view.scrubSeconds ?? view.positionSeconds),
    };
    wakeRef.current?.();
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const context = canvas.getContext("2d");
    if (context === null) return;
    const offscreen = offscreenRef.current ?? document.createElement("canvas");
    offscreenRef.current = offscreen;
    const stillness = window.matchMedia(REDUCED_MOTION_QUERY);

    let frame = 0;
    let previous: number | null = null;

    const render = (now: number): void => {
      frame = 0;
      const pending = snapshotRef.current;
      const sinceLast = previous === null ? 0 : Math.min(FRAME_CEILING_MS, now - previous);
      previous = now;
      if (pending === null) return;

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (width <= 0 || height <= 0) return;

      const host = trackRef.current;
      const theme = document.documentElement.dataset.theme ?? "";
      if (host !== null && probedThemeRef.current !== theme) {
        probedThemeRef.current = theme;
        colorsRef.current = waveColors(host);
      }
      const colors = colorsRef.current;
      if (colors === null) return;

      const ratio = Math.min(WAVE.MAX_PIXEL_RATIO, window.devicePixelRatio || 1);
      if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        offscreen.width = canvas.width;
        offscreen.height = canvas.height;
      }

      const still = stillness.matches;
      const travelling = pending.playing && !pending.loading && !still;
      const jumped = Math.abs(pending.progress - shownRef.current) > PROGRESS_SNAP_FRACTION;
      shownRef.current =
        pending.dragging || still || jumped
          ? pending.progress
          : followed(shownRef.current, pending.progress, sinceLast, PROGRESS_FOLLOW_MS);
      const heard = still ? 1 : audioEnergy();
      const swell = heard > energyRef.current ? ENERGY_ATTACK_MS : ENERGY_RELEASE_MS;
      energyRef.current = still ? 1 : followed(energyRef.current, heard, sinceLast, swell);
      if (travelling) elapsedRef.current += sinceLast / 1000;

      paintWave(context, offscreen, {
        ...pending,
        width,
        height,
        ratio,
        time: elapsedRef.current,
        progress: shownRef.current,
        energy: energyRef.current,
        colors,
      });

      const easing =
        Math.abs(shownRef.current - pending.progress) > SETTLE_EPSILON ||
        Math.abs(energyRef.current - heard) > SETTLE_EPSILON;
      if (travelling || easing) wake();
    };

    const wake = () => {
      if (frame !== 0) return;
      frame = requestAnimationFrame(render);
    };

    const observer = new ResizeObserver(wake);
    observer.observe(canvas);
    stillness.addEventListener("change", wake);
    wakeRef.current = wake;
    wake();

    return () => {
      observer.disconnect();
      stillness.removeEventListener("change", wake);
      wakeRef.current = null;
      cancelAnimationFrame(frame);
      frame = 0;
    };
  }, []);

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={0}
      aria-label={t("controls.seek")}
      aria-valuemin={0}
      aria-valuemax={Math.round(duration)}
      aria-valuenow={Math.round(announced)}
      aria-valuetext={formatClock(announced)}
      className={waveTrack({ size })}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        originRef.current = shownRef.current;
        setDragging(true);
        actions.scrubTo(secondsFromPointer(event.clientX, event.currentTarget.getBoundingClientRect(), duration));
      }}
      onPointerMove={(event) => {
        actions.scrubTo(secondsFromPointer(event.clientX, event.currentTarget.getBoundingClientRect(), duration));
      }}
      onPointerUp={(event) => {
        event.currentTarget.releasePointerCapture(event.pointerId);
        originRef.current = null;
        setDragging(false);
        clampedSeek(secondsFromPointer(event.clientX, event.currentTarget.getBoundingClientRect(), duration));
        actions.scrubTo(null);
      }}
      onPointerLeave={() => {
        if (!dragging) actions.scrubTo(null);
      }}
      onPointerCancel={(event) => {
        event.currentTarget.releasePointerCapture(event.pointerId);
        originRef.current = null;
        setDragging(false);
        actions.scrubTo(null);
      }}
      onKeyDown={handleKeyDown}
    >
      <canvas ref={canvasRef} className={waveCanvas()} aria-hidden />
    </div>
  );
}
