import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createPlayerActions, createPlayerTrack, createPlayerView } from "@test/factories";

import { SEEK_PAGE_SECONDS, SEEK_STEP_SECONDS } from "../constants";
import { PlayerWave } from "../PlayerWave";
import type { PlayerView } from "../types";

class FakeResizeObserver {
  readonly observe = vi.fn();
  readonly unobserve = vi.fn();
  readonly disconnect = vi.fn();
}

function renderWave(overrides: Partial<PlayerView> = {}) {
  const actions = createPlayerActions();
  const view = createPlayerView({ track: createPlayerTrack({ durationSeconds: 300 }), ...overrides });
  render(<PlayerWave view={view} actions={actions} size="bar" />);
  return { actions, slider: screen.getByRole("slider") };
}

function withWidth(element: HTMLElement, left: number, width: number): void {
  element.getBoundingClientRect = () => new DOMRect(left, 0, width, 40);
}

beforeEach(() => {
  vi.stubGlobal("ResizeObserver", FakeResizeObserver);
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
});

describe("the seek bar as a slider", () => {
  it("reports where the track has reached in seconds and as a clock", () => {
    const { slider } = renderWave({ positionSeconds: 65 });

    expect(slider).toHaveAttribute("aria-valuemin", "0");
    expect(slider).toHaveAttribute("aria-valuemax", "300");
    expect(slider).toHaveAttribute("aria-valuenow", "65");
    expect(slider).toHaveAttribute("aria-valuetext", "1:05");
  });

  it("reports the position being dragged to rather than the one still playing", () => {
    const { slider } = renderWave({ positionSeconds: 65, scrubSeconds: 200 });

    expect(slider).toHaveAttribute("aria-valuenow", "65");
  });
});

describe("seeking from the keyboard", () => {
  it("steps forward and back by a few seconds with the arrows", () => {
    const { actions, slider } = renderWave({ positionSeconds: 100 });

    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(actions.seekTo).toHaveBeenCalledWith(100 + SEEK_STEP_SECONDS);

    fireEvent.keyDown(slider, { key: "ArrowLeft" });
    expect(actions.seekTo).toHaveBeenCalledWith(100 - SEEK_STEP_SECONDS);
  });

  it("jumps by a larger step with page up and page down", () => {
    const { actions, slider } = renderWave({ positionSeconds: 100 });

    fireEvent.keyDown(slider, { key: "PageUp" });
    expect(actions.seekTo).toHaveBeenCalledWith(100 + SEEK_PAGE_SECONDS);

    fireEvent.keyDown(slider, { key: "PageDown" });
    expect(actions.seekTo).toHaveBeenCalledWith(100 - SEEK_PAGE_SECONDS);
  });

  it("goes to the start and to the end", () => {
    const { actions, slider } = renderWave({ positionSeconds: 100 });

    fireEvent.keyDown(slider, { key: "Home" });
    expect(actions.seekTo).toHaveBeenCalledWith(0);

    fireEvent.keyDown(slider, { key: "End" });
    expect(actions.seekTo).toHaveBeenCalledWith(300);
  });

  it("never seeks past either end of the track", () => {
    const { actions, slider } = renderWave({ positionSeconds: 2 });

    fireEvent.keyDown(slider, { key: "PageDown" });
    expect(actions.seekTo).toHaveBeenCalledWith(0);

    fireEvent.keyDown(slider, { key: "End" });
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(actions.seekTo).not.toHaveBeenCalledWith(305);
  });

  it("ignores a key the seek bar has no meaning for", () => {
    const { actions, slider } = renderWave();

    fireEvent.keyDown(slider, { key: "a" });

    expect(actions.seekTo).not.toHaveBeenCalled();
  });
});

describe("dragging the seek bar", () => {
  it("shows the position under the pointer without committing to it", () => {
    const { actions, slider } = renderWave();
    withWidth(slider, 0, 200);
    slider.setPointerCapture = vi.fn();

    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 100 });

    expect(actions.scrubTo).toHaveBeenCalledWith(150);
    expect(actions.seekTo).not.toHaveBeenCalled();
  });

  it("follows the pointer as it moves", () => {
    const { actions, slider } = renderWave();
    withWidth(slider, 0, 200);
    slider.setPointerCapture = vi.fn();

    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 0 });
    fireEvent.pointerMove(slider, { pointerId: 1, clientX: 50 });

    expect(actions.scrubTo).toHaveBeenLastCalledWith(75);
  });

  it("commits the seek when the pointer is let go", () => {
    const { actions, slider } = renderWave();
    withWidth(slider, 0, 200);
    slider.setPointerCapture = vi.fn();
    slider.releasePointerCapture = vi.fn();

    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 100 });
    fireEvent.pointerUp(slider, { pointerId: 1, clientX: 40 });

    expect(actions.seekTo).toHaveBeenCalledWith(60);
    expect(actions.scrubTo).toHaveBeenLastCalledWith(null);
  });

  it("clamps a pointer dragged off the end of the bar", () => {
    const { actions, slider } = renderWave();
    withWidth(slider, 0, 200);
    slider.setPointerCapture = vi.fn();
    slider.releasePointerCapture = vi.fn();

    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 0 });
    fireEvent.pointerUp(slider, { pointerId: 1, clientX: 900 });

    expect(actions.seekTo).toHaveBeenCalledWith(300);
  });

  it("abandons the seek when the drag is cancelled", () => {
    const { actions, slider } = renderWave();
    withWidth(slider, 0, 200);
    slider.setPointerCapture = vi.fn();
    slider.releasePointerCapture = vi.fn();

    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 100 });
    fireEvent.pointerCancel(slider, { pointerId: 1 });

    expect(actions.seekTo).not.toHaveBeenCalled();
    expect(actions.scrubTo).toHaveBeenLastCalledWith(null);
  });

  it("clears the hovered position when the pointer leaves without a drag", () => {
    const { actions, slider } = renderWave();

    fireEvent.pointerLeave(slider);

    expect(actions.scrubTo).toHaveBeenCalledWith(null);
  });

  it("keeps the dragged position when the pointer leaves mid-drag", () => {
    const { actions, slider } = renderWave();
    withWidth(slider, 0, 200);
    slider.setPointerCapture = vi.fn();
    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 100 });
    vi.mocked(actions.scrubTo).mockClear();

    fireEvent.pointerLeave(slider);

    expect(actions.scrubTo).not.toHaveBeenCalled();
  });

  it("reads a collapsed bar as the start of the track rather than dividing by nothing", () => {
    const { actions, slider } = renderWave();
    withWidth(slider, 0, 0);
    slider.setPointerCapture = vi.fn();

    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 40 });

    expect(actions.scrubTo).toHaveBeenCalledWith(0);
  });
});
