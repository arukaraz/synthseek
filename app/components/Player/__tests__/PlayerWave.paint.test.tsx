import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createPlayerActions, createPlayerTrack, createPlayerView } from "@test/factories";

import { PlayerWave } from "../PlayerWave";
import type { PlayerView } from "../types";

const surfaces: FakeSurface[] = [];
const frames = new Map<number, () => void>();
let nextFrameId = 0;
let stillness = false;

class FakeSurface {
  fillStyle = "";
  strokeStyle = "";
  shadowColor = "";
  shadowBlur = 0;
  globalAlpha = 1;
  lineWidth = 0;
  font = "";
  textBaseline = "";
  textAlign = "";
  globalCompositeOperation = "";
  strokes = 0;
  fills = 0;
  drawn = 0;
  readonly save = vi.fn();
  readonly restore = vi.fn();
  readonly setTransform = vi.fn();
  readonly clearRect = vi.fn();
  readonly fillRect = vi.fn();
  readonly beginPath = vi.fn();
  readonly moveTo = vi.fn();
  readonly lineTo = vi.fn();
  readonly arc = vi.fn();
  readonly roundRect = vi.fn();
  readonly setLineDash = vi.fn();
  readonly measureText = vi.fn(() => ({ width: 30 }));
  readonly fillText = vi.fn();
  readonly createLinearGradient = vi.fn(() => ({ addColorStop: vi.fn() }));

  constructor() {
    surfaces.push(this);
  }

  stroke(): void {
    this.strokes += 1;
  }

  fill(): void {
    this.fills += 1;
  }

  drawImage(): void {
    this.drawn += 1;
  }
}

class FakeResizeObserver {
  constructor(readonly callback: () => void) {
    resizeCallbacks.push(callback);
  }
  readonly observe = vi.fn();
  readonly unobserve = vi.fn();
  readonly disconnect = vi.fn();
}

let resizeCallbacks: (() => void)[] = [];

function renderWave(overrides: Partial<PlayerView> = {}) {
  const actions = createPlayerActions();
  const view = createPlayerView({ track: createPlayerTrack({ durationSeconds: 300 }), ...overrides });
  const result = render(<PlayerWave view={view} actions={actions} size="bar" />);
  return { ...result, actions, view };
}

function paint(at = 16): void {
  act(() => {
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach((frame) => frame());
    vi.advanceTimersByTime(at);
  });
}

function pendingFrames(): number {
  return frames.size;
}

beforeEach(() => {
  vi.useFakeTimers();
  surfaces.length = 0;
  frames.clear();
  nextFrameId = 0;
  resizeCallbacks = [];
  stillness = false;

  vi.stubGlobal("ResizeObserver", FakeResizeObserver);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    nextFrameId += 1;
    frames.set(nextFrameId, () => callback(performance.now()));
    return nextFrameId;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => {
    frames.delete(id);
  });
  Object.defineProperty(window, "devicePixelRatio", { value: 2, configurable: true, writable: true });
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      get matches() {
        return query.includes("prefers-reduced-motion") ? stillness : false;
      },
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });

  Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
    configurable: true,
    writable: true,
    value: () => new FakeSurface(),
  });
  Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get: () => 400 });
  Object.defineProperty(HTMLElement.prototype, "clientHeight", { configurable: true, get: () => 48 });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  Reflect.deleteProperty(HTMLElement.prototype, "clientWidth");
  Reflect.deleteProperty(HTMLElement.prototype, "clientHeight");
});

describe("painting the wave", () => {
  it("paints the strip as soon as the canvas is on screen", () => {
    renderWave();

    paint();

    expect(surfaces[0]?.strokes).toBeGreaterThan(0);
    expect(surfaces[0]?.drawn).toBeGreaterThan(0);
  });

  it("sizes the canvas to the device's pixels so the wave is not blurred", () => {
    renderWave();

    paint();

    const canvas = document.querySelector("canvas");
    expect(canvas?.width).toBe(800);
    expect(canvas?.height).toBe(96);
  });

  it("keeps asking for frames while the track is playing", () => {
    renderWave({ playing: true });

    paint();

    expect(pendingFrames()).toBeGreaterThan(0);
  });

  it("settles rather than animating forever while the track is paused", () => {
    renderWave({ positionSeconds: 0 });

    paint();
    paint();
    paint();
    paint();

    expect(pendingFrames()).toBe(0);
  });

  it("stops animating when the listener has asked for less motion", () => {
    stillness = true;
    renderWave({ playing: true });

    paint();

    expect(pendingFrames()).toBe(0);
  });

  it("paints again when the strip is resized", () => {
    renderWave();
    paint();
    const painted = surfaces[0]?.strokes ?? 0;

    act(() => {
      resizeCallbacks.forEach((callback) => callback());
    });
    paint();

    expect(surfaces[0]?.strokes).toBeGreaterThan(painted);
  });

  it("draws the drag marker and the time tag while the listener is scrubbing", () => {
    const { rerender, actions } = renderWave();
    paint();
    const tagged = surfaces[0]?.fillText.mock.calls.length ?? 0;

    const dragging = createPlayerView({
      track: createPlayerTrack({ durationSeconds: 300 }),
      scrubSeconds: 120,
    });
    rerender(<PlayerWave view={dragging} actions={actions} size="bar" />);
    paint();

    expect(surfaces[0]?.fillText.mock.calls.length).toBeGreaterThan(tagged);
  });

  it("snaps to a position the listener jumped to rather than sliding across the strip", () => {
    const { rerender, actions } = renderWave({ positionSeconds: 0 });
    paint();

    const jumped = createPlayerView({ track: createPlayerTrack({ durationSeconds: 300 }), positionSeconds: 280 });
    rerender(<PlayerWave view={jumped} actions={actions} size="bar" />);
    paint();
    paint();

    expect(pendingFrames()).toBe(0);
  });

  it("settles onto the new track's position at once rather than sliding across the strip", () => {
    const { rerender, actions } = renderWave({ positionSeconds: 0 });
    paint();
    expect(pendingFrames()).toBe(0);

    const next = createPlayerView({
      track: createPlayerTrack({ id: "track-2", durationSeconds: 300 }),
      positionSeconds: 3,
    });
    rerender(<PlayerWave view={next} actions={actions} size="bar" />);
    paint();

    expect(pendingFrames()).toBe(0);
  });

  it("slides to a position that merely moved within the same track", () => {
    const { rerender, actions } = renderWave({ positionSeconds: 0 });
    paint();

    const moved = createPlayerView({
      track: createPlayerTrack({ durationSeconds: 300 }),
      positionSeconds: 3,
    });
    rerender(<PlayerWave view={moved} actions={actions} size="bar" />);
    paint();

    expect(pendingFrames()).toBeGreaterThan(0);
  });

  it("stops painting once the player goes away", () => {
    const { unmount } = renderWave({ playing: true });
    paint();

    unmount();
    const painted = surfaces[0]?.strokes ?? 0;
    paint();

    expect(surfaces[0]?.strokes).toBe(painted);
  });

  it("paints nothing on a browser that gives it no drawing surface", () => {
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      configurable: true,
      writable: true,
      value: () => null,
    });

    renderWave();
    paint();

    expect(surfaces).toHaveLength(0);
    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("paints nothing while the strip has been collapsed to nothing", () => {
    Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get: () => 0 });

    renderWave();
    paint();

    expect(surfaces[0]?.strokes ?? 0).toBe(0);
  });
});
