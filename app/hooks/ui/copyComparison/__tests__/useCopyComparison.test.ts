import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ComparedCopy } from "../types";

const player = vi.hoisted(() => ({ pauseHere: vi.fn() }));

vi.mock("@hooks/ui/player", () => ({ playerActions: player }));

import { useCopyComparison } from "../useCopyComparison";

class FakeAudio {
  static made: FakeAudio[] = [];
  paused = true;
  seeking = false;
  readyState = 4;
  volume = 1;
  src = "";
  preload = "";
  time = 0;
  seeks: number[] = [];

  constructor() {
    FakeAudio.made.push(this);
  }

  get currentTime(): number {
    return this.time;
  }

  set currentTime(value: number) {
    this.seeks.push(value);
    this.time = value;
  }

  listeners = new Map<string, () => void>();

  addEventListener(type: string, listener: () => void): void {
    this.listeners.set(type, listener);
  }

  fail(): void {
    this.listeners.get("error")?.();
  }

  removeAttribute(): void {}

  play(): Promise<void> {
    this.paused = false;
    return Promise.resolve();
  }

  pause(): void {
    this.paused = true;
  }
}

function copy(id: string, overrides: Partial<ComparedCopy> = {}): ComparedCopy {
  return { id, src: `/audio/${id}`, offsetSeconds: 0, loudnessLufs: -10, durationSeconds: 200, ...overrides };
}

function element(index: number): FakeAudio {
  const made = FakeAudio.made[index];
  if (made === undefined) throw new Error(`no audio element ${index}`);
  return made;
}

function frames(milliseconds: number) {
  act(() => {
    vi.advanceTimersByTime(milliseconds);
  });
}

beforeEach(() => {
  FakeAudio.made = [];
  vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] });
  vi.stubGlobal("Audio", FakeAudio);
  player.pauseHere.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("playing copies side by side", () => {
  const copies = [copy("a"), copy("b")];

  it("sounds only the first copy until another is switched on", () => {
    const { result } = renderHook(() => useCopyComparison(copies));
    act(() => result.current.toggle());
    expect(element(0).paused).toBe(false);
    expect(element(1).paused).toBe(true);
  });

  it("stops instead of running on in silence when a copy cannot be loaded", () => {
    const { result } = renderHook(() => useCopyComparison(copies));
    act(() => result.current.toggle());
    act(() => element(0).fail());
    expect(result.current.playing).toBe(false);
    expect(element(0).paused).toBe(true);
  });

  it("pauses the main player before the comparison starts", () => {
    const { result } = renderHook(() => useCopyComparison(copies));
    act(() => result.current.toggle());
    expect(player.pauseHere).toHaveBeenCalledTimes(1);
  });

  it("never moves a copy that is switched off while the others play", () => {
    const { result } = renderHook(() => useCopyComparison(copies));
    act(() => result.current.toggle());
    for (let second = 1; second <= 6; second += 1) {
      element(0).time = second;
      frames(1000);
    }
    expect(element(1).seeks).toEqual([]);
  });

  it("follows the playing copy's own clock instead of the wall clock", () => {
    const { result } = renderHook(() => useCopyComparison(copies));
    act(() => result.current.toggle());
    element(0).time = 1.25;
    frames(3000);
    expect(result.current.position).toBeCloseTo(1.25);
    expect(element(0).seeks).toEqual([]);
  });

  it("falls back to the wall clock while no playing copy has audio to give yet", () => {
    const { result } = renderHook(() => useCopyComparison(copies));
    element(0).readyState = 1;
    act(() => result.current.toggle());
    frames(2000);
    expect(result.current.position).toBeGreaterThan(1.5);
  });

  it("brings a second playing copy back in line only once it drifts past the tolerance", () => {
    const { result } = renderHook(() => useCopyComparison(copies));
    act(() => result.current.toggleCopy("b"));
    act(() => result.current.toggle());
    element(1).seeks = [];
    element(0).time = 5;
    element(1).time = 4.95;
    frames(16);
    expect(element(1).seeks).toEqual([]);
    element(0).time = 6;
    element(1).time = 5.5;
    frames(16);
    expect(element(1).seeks).toEqual([6]);
  });

  it("leaves a copy alone while it is still seeking", () => {
    const { result } = renderHook(() => useCopyComparison(copies));
    act(() => result.current.toggleCopy("b"));
    act(() => result.current.toggle());
    element(1).seeks = [];
    element(1).seeking = true;
    element(0).time = 9;
    frames(16);
    expect(element(1).seeks).toEqual([]);
  });

  it("starts every playing copy from the exact position asked for", () => {
    const { result } = renderHook(() => useCopyComparison(copies));
    act(() => result.current.toggleCopy("b"));
    act(() => result.current.seek(30));
    expect(element(0).time).toBe(30);
    expect(element(1).time).toBe(30);
  });

  it("starts an aligned copy at its own offset into the song", () => {
    const { result } = renderHook(() => useCopyComparison([copy("a"), copy("b", { offsetSeconds: 2 })]));
    act(() => result.current.toggleCopy("b"));
    act(() => result.current.setAligned(true));
    act(() => result.current.seek(30));
    expect(element(1).time).toBe(28);
  });

  it("pauses a copy as soon as it is switched off", () => {
    const { result } = renderHook(() => useCopyComparison(copies));
    act(() => result.current.toggleCopy("b"));
    act(() => result.current.toggle());
    expect(element(1).paused).toBe(false);
    act(() => result.current.toggleCopy("b"));
    expect(element(1).paused).toBe(true);
  });

  it("jumps back to the start of the loop once the playing copy passes its end", () => {
    const { result } = renderHook(() => useCopyComparison(copies));
    act(() => result.current.seek(60));
    act(() => result.current.toggleLoop());
    expect(result.current.loop).toEqual({ start: 59, end: 65 });
    act(() => result.current.toggle());
    element(0).time = 65.2;
    frames(16);
    expect(result.current.position).toBe(59);
    expect(element(0).time).toBe(59);
  });

  it("stops at the end of the timeline", () => {
    const { result } = renderHook(() => useCopyComparison(copies));
    act(() => result.current.toggle());
    element(0).time = 200;
    frames(16);
    expect(result.current.playing).toBe(false);
    expect(element(0).paused).toBe(true);
  });
});
