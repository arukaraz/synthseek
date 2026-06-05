import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTapToOpen } from "../useTapToOpen";
import type { PointerEvent as ReactPointerEvent } from "react";

function pointerEvent(
  overrides: Partial<{ pointerType: string; clientX: number; clientY: number; timeStamp: number }>
): ReactPointerEvent {
  const preventDefault = vi.fn();
  return {
    pointerType: overrides.pointerType ?? "touch",
    clientX: overrides.clientX ?? 0,
    clientY: overrides.clientY ?? 0,
    timeStamp: overrides.timeStamp ?? 0,
    preventDefault,
  } as unknown as ReactPointerEvent;
}

describe("useTapToOpen", () => {
  it("prevents default on a touch pointerdown to stop the immediate Radix open", () => {
    const { result } = renderHook(() => useTapToOpen());
    const down = pointerEvent({ pointerType: "touch" });

    act(() => result.current.triggerProps.onPointerDown(down));

    expect(down.preventDefault).toHaveBeenCalledTimes(1);
  });

  it("opens on a clean tap (touch down then up with negligible movement)", () => {
    const { result } = renderHook(() => useTapToOpen());

    act(() => {
      result.current.triggerProps.onPointerDown(pointerEvent({ clientX: 100, clientY: 100, timeStamp: 0 }));
      result.current.triggerProps.onPointerUp(pointerEvent({ clientX: 103, clientY: 102, timeStamp: 120 }));
    });

    expect(result.current.open).toBe(true);
  });

  it("does not open when the touch moves past the threshold (a drag scrolls instead)", () => {
    const { result } = renderHook(() => useTapToOpen());

    act(() => {
      result.current.triggerProps.onPointerDown(pointerEvent({ clientX: 100, clientY: 100, timeStamp: 0 }));
      result.current.triggerProps.onPointerUp(pointerEvent({ clientX: 100, clientY: 160, timeStamp: 200 }));
    });

    expect(result.current.open).toBe(false);
  });

  it("does not open when the press is held longer than the tap window", () => {
    const { result } = renderHook(() => useTapToOpen());

    act(() => {
      result.current.triggerProps.onPointerDown(pointerEvent({ clientX: 100, clientY: 100, timeStamp: 0 }));
      result.current.triggerProps.onPointerUp(pointerEvent({ clientX: 100, clientY: 100, timeStamp: 1500 }));
    });

    expect(result.current.open).toBe(false);
  });

  it("toggles closed on a second tap", () => {
    const { result } = renderHook(() => useTapToOpen());

    act(() => {
      result.current.triggerProps.onPointerDown(pointerEvent({ clientX: 100, clientY: 100, timeStamp: 0 }));
      result.current.triggerProps.onPointerUp(pointerEvent({ clientX: 100, clientY: 100, timeStamp: 100 }));
    });
    expect(result.current.open).toBe(true);

    act(() => {
      result.current.triggerProps.onPointerDown(pointerEvent({ clientX: 100, clientY: 100, timeStamp: 200 }));
      result.current.triggerProps.onPointerUp(pointerEvent({ clientX: 100, clientY: 100, timeStamp: 300 }));
    });
    expect(result.current.open).toBe(false);
  });

  it("leaves mouse pointers to Radix (no preventDefault, no manual open)", () => {
    const { result } = renderHook(() => useTapToOpen());
    const down = pointerEvent({ pointerType: "mouse", clientX: 100, clientY: 100, timeStamp: 0 });

    act(() => {
      result.current.triggerProps.onPointerDown(down);
      result.current.triggerProps.onPointerUp(pointerEvent({ pointerType: "mouse", clientX: 100, clientY: 100 }));
    });

    expect(down.preventDefault).not.toHaveBeenCalled();
    expect(result.current.open).toBe(false);
  });

  it("does not open after a cancelled gesture", () => {
    const { result } = renderHook(() => useTapToOpen());

    act(() => {
      result.current.triggerProps.onPointerDown(pointerEvent({ clientX: 100, clientY: 100, timeStamp: 0 }));
      result.current.triggerProps.onPointerCancel(pointerEvent({ clientX: 100, clientY: 100, timeStamp: 50 }));
      result.current.triggerProps.onPointerUp(pointerEvent({ clientX: 100, clientY: 100, timeStamp: 100 }));
    });

    expect(result.current.open).toBe(false);
  });

  it("respects custom thresholds", () => {
    const { result } = renderHook(() => useTapToOpen({ moveThreshold: 30, tapTimeout: 2000 }));

    act(() => {
      result.current.triggerProps.onPointerDown(pointerEvent({ clientX: 100, clientY: 100, timeStamp: 0 }));
      result.current.triggerProps.onPointerUp(pointerEvent({ clientX: 125, clientY: 100, timeStamp: 1800 }));
    });

    expect(result.current.open).toBe(true);
  });
});
