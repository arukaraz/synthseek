import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useCountdown } from "../useCountdown";

describe("useCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-27T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("reads zero when there is no deadline", () => {
    const { result } = renderHook(() => useCountdown(null));

    expect(result.current).toBe(0);
  });

  it("starts at the whole seconds left and counts down once a second", () => {
    const deadline = Date.now() + 5000;
    const { result } = renderHook(() => useCountdown(deadline));

    expect(result.current).toBe(5);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(4);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current).toBe(2);
  });

  it("rounds a part second up so it never reads zero before the deadline", () => {
    const deadline = Date.now() + 1500;
    const { result } = renderHook(() => useCountdown(deadline));

    expect(result.current).toBe(2);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(1);
  });

  it("stops at zero and never goes negative", () => {
    const deadline = Date.now() + 2000;
    const { result } = renderHook(() => useCountdown(deadline));

    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    expect(result.current).toBe(0);
  });

  it("restarts from the new deadline", () => {
    const { result, rerender } = renderHook(({ deadline }) => useCountdown(deadline), {
      initialProps: { deadline: Date.now() + 3000 },
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current).toBe(1);

    rerender({ deadline: Date.now() + 30_000 });
    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(result.current).toBe(30);
  });

  it("stops ticking when it unmounts", () => {
    const { unmount } = renderHook(() => useCountdown(Date.now() + 5000));

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });
});
