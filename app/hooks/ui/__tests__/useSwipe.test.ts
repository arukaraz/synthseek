import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSwipe } from "../useSwipe";

function touchEvent(clientX: number): React.TouchEvent {
  return { touches: [{ clientX }] } as unknown as React.TouchEvent;
}

describe("useSwipe", () => {
  it("calls onSwipeLeft when finger moves left past the threshold", () => {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();
    const { result } = renderHook(() => useSwipe({ onSwipeLeft, onSwipeRight }));

    act(() => {
      result.current.onTouchStart(touchEvent(200));
      result.current.onTouchMove(touchEvent(120));
      result.current.onTouchEnd();
    });

    expect(onSwipeLeft).toHaveBeenCalledTimes(1);
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it("calls onSwipeRight when finger moves right past the threshold", () => {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();
    const { result } = renderHook(() => useSwipe({ onSwipeLeft, onSwipeRight }));

    act(() => {
      result.current.onTouchStart(touchEvent(100));
      result.current.onTouchMove(touchEvent(180));
      result.current.onTouchEnd();
    });

    expect(onSwipeRight).toHaveBeenCalledTimes(1);
    expect(onSwipeLeft).not.toHaveBeenCalled();
  });

  it("does not fire when the movement is below the threshold", () => {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();
    const { result } = renderHook(() => useSwipe({ onSwipeLeft, onSwipeRight }));

    act(() => {
      result.current.onTouchStart(touchEvent(200));
      result.current.onTouchMove(touchEvent(180));
      result.current.onTouchEnd();
    });

    expect(onSwipeLeft).not.toHaveBeenCalled();
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it("respects a custom threshold", () => {
    const onSwipeLeft = vi.fn();
    const { result } = renderHook(() => useSwipe({ onSwipeLeft, threshold: 100 }));

    act(() => {
      result.current.onTouchStart(touchEvent(200));
      result.current.onTouchMove(touchEvent(120));
      result.current.onTouchEnd();
    });

    expect(onSwipeLeft).not.toHaveBeenCalled();

    act(() => {
      result.current.onTouchStart(touchEvent(200));
      result.current.onTouchMove(touchEvent(80));
      result.current.onTouchEnd();
    });

    expect(onSwipeLeft).toHaveBeenCalledTimes(1);
  });

  it("ignores touch move and end when no touch started", () => {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();
    const { result } = renderHook(() => useSwipe({ onSwipeLeft, onSwipeRight }));

    act(() => {
      result.current.onTouchMove(touchEvent(120));
      result.current.onTouchEnd();
    });

    expect(onSwipeLeft).not.toHaveBeenCalled();
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it("resets between gestures so a second tap does not re-fire", () => {
    const onSwipeLeft = vi.fn();
    const { result } = renderHook(() => useSwipe({ onSwipeLeft }));

    act(() => {
      result.current.onTouchStart(touchEvent(200));
      result.current.onTouchMove(touchEvent(100));
      result.current.onTouchEnd();
    });
    expect(onSwipeLeft).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.onTouchStart(touchEvent(200));
      result.current.onTouchEnd();
    });
    expect(onSwipeLeft).toHaveBeenCalledTimes(1);
  });
});
