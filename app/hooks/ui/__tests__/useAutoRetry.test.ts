import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { useAutoRetry } from "../useAutoRetry";

describe("useAutoRetry", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("fires the first auto-retry after the base delay", () => {
    const onRetry = vi.fn();
    renderHook(() => useAutoRetry({ onRetry, baseDelayMs: 3000, maxDelayMs: 30000 }));

    expect(onRetry).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("backs off exponentially up to the cap", () => {
    const onRetry = vi.fn();
    renderHook(() => useAutoRetry({ onRetry, baseDelayMs: 3000, maxDelayMs: 12000 }));

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(onRetry).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(onRetry).toHaveBeenCalledTimes(2);

    act(() => {
      vi.advanceTimersByTime(12000);
    });
    expect(onRetry).toHaveBeenCalledTimes(3);

    act(() => {
      vi.advanceTimersByTime(12000);
    });
    expect(onRetry).toHaveBeenCalledTimes(4);
  });

  it("retryNow fires immediately and reports retrying", () => {
    const onRetry = vi.fn();
    const { result } = renderHook(() => useAutoRetry({ onRetry, baseDelayMs: 3000, maxDelayMs: 30000 }));

    act(() => {
      result.current.retryNow();
    });

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(result.current.isRetrying).toBe(true);
  });

  it("clears the pending timer on unmount", () => {
    const onRetry = vi.fn();
    const { unmount } = renderHook(() => useAutoRetry({ onRetry, baseDelayMs: 3000, maxDelayMs: 30000 }));

    unmount();

    act(() => {
      vi.advanceTimersByTime(60000);
    });

    expect(onRetry).not.toHaveBeenCalled();
  });
});
