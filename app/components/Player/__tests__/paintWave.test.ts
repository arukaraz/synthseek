import { describe, expect, it } from "vitest";

import { WAVE_ENERGY_CEILING } from "@hooks/ui/player/constants";

import { WAVE } from "../constants";
import { paintWave } from "../helpers";
import type { WaveCanvas, WaveGradient, WavePaint, WaveSurface } from "../types";

interface Recorder {
  surface: WaveSurface;
  strokedY: number[];
  filledY: number[];
}

function recorder(): Recorder {
  const strokedY: number[] = [];
  const filledY: number[] = [];
  let pending: number[] = [];
  const gradient: WaveGradient = { addColorStop: () => undefined };
  const surface: WaveSurface = {
    fillStyle: "",
    strokeStyle: "",
    shadowColor: "",
    shadowBlur: 0,
    globalAlpha: 1,
    lineWidth: 0,
    font: "",
    textBaseline: "",
    textAlign: "",
    globalCompositeOperation: "",
    save: () => undefined,
    restore: () => undefined,
    setTransform: () => undefined,
    clearRect: () => undefined,
    fillRect: (_x, y, _width, height) => {
      filledY.push(y, y + height);
    },
    beginPath: () => {
      pending = [];
    },
    moveTo: (_x, y) => {
      pending.push(y);
    },
    lineTo: (_x, y) => {
      pending.push(y);
    },
    arc: (_x, y, radius) => {
      filledY.push(y - radius, y + radius);
    },
    roundRect: (_x, y, _width, height) => {
      filledY.push(y, y + height);
    },
    stroke: () => {
      strokedY.push(...pending);
    },
    fill: () => undefined,
    fillText: () => undefined,
    measureText: () => ({ width: 24 }),
    createLinearGradient: () => gradient,
    drawImage: () => undefined,
    setLineDash: () => undefined,
  };
  return { surface, strokedY, filledY };
}

function offscreenOf(inner: WaveSurface): WaveCanvas {
  return { width: 0, height: 0, getContext: () => inner };
}

function paintOf(height: number, energy: number, dragging: boolean): WavePaint {
  return {
    phase: 0.7,
    progress: 0.4,
    origin: null,
    hover: null,
    dragging,
    playing: true,
    loading: false,
    label: "1:23",
    width: 600,
    height,
    ratio: 2,
    time: 3.5,
    energy,
    colors: {
      lobes: ["a", "b", "c"],
      primary: "p",
      foreground: "f",
      surface: "s",
      primaryForeground: "pf",
      mono: "monospace",
    },
  };
}

function strokeHalfWidth(height: number): number {
  return Math.max(WAVE.MIN_LINE_WIDTH_PX, height * WAVE.LINE_WIDTH_SHARE) / 2;
}

describe("paintWave", () => {
  it("draws the wave rather than returning without painting", () => {
    const front = recorder();
    const back = recorder();
    paintWave(front.surface, offscreenOf(back.surface), paintOf(36, 1, false));
    expect(front.strokedY.length).toBeGreaterThan(0);
    expect(back.strokedY.length).toBeGreaterThan(0);
  });

  [36, 58].forEach((height) => {
    it(`keeps the loudest wave inside a ${height}px strip`, () => {
      const front = recorder();
      const back = recorder();
      paintWave(front.surface, offscreenOf(back.surface), paintOf(height, WAVE_ENERGY_CEILING, false));
      const painted = [...front.strokedY, ...back.strokedY];
      expect(painted.length).toBeGreaterThan(0);
      const reach = Math.max(...painted.map((y) => Math.abs(y - height / 2)));
      expect(reach + strokeHalfWidth(height)).toBeLessThanOrEqual(height / 2);
    });

    it(`keeps a dragged wave inside a ${height}px strip, where the gain is highest`, () => {
      const front = recorder();
      const back = recorder();
      paintWave(front.surface, offscreenOf(back.surface), paintOf(height, WAVE_ENERGY_CEILING, true));
      const painted = [...front.strokedY, ...back.strokedY];
      expect(painted.length).toBeGreaterThan(0);
      const reach = Math.max(...painted.map((y) => Math.abs(y - height / 2)));
      expect(reach + strokeHalfWidth(height)).toBeLessThanOrEqual(height / 2);
    });
  });

  it("still swings the wave well clear of the baseline when the audio is loud", () => {
    const front = recorder();
    const back = recorder();
    paintWave(front.surface, offscreenOf(back.surface), paintOf(36, WAVE_ENERGY_CEILING, false));
    const reach = Math.max(...back.strokedY.map((y) => Math.abs(y - 18)));
    expect(reach).toBeGreaterThan(36 * WAVE.HEIGHT_SHARE * 0.8);
  });

  it("draws nothing into a collapsed strip", () => {
    const front = recorder();
    const back = recorder();
    paintWave(front.surface, offscreenOf(back.surface), { ...paintOf(0, 1, false), width: 0 });
    expect(front.strokedY).toHaveLength(0);
  });
});
