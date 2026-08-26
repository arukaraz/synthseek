import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useCopiedFlag } from "../useCopiedFlag";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useCopiedFlag", () => {
  it("raises the flag on copy and lowers it after the dwell", () => {
    const { result } = renderHook(() => useCopiedFlag());

    act(() => result.current.markCopied());
    expect(result.current.copied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.copied).toBe(false);
  });

  it("lowers the flag immediately on reset, without waiting for the dwell", () => {
    const { result } = renderHook(() => useCopiedFlag());

    act(() => result.current.markCopied());
    act(() => result.current.resetCopied());

    expect(result.current.copied).toBe(false);
  });

  it("drops its pending timer on unmount, so closing the dialog inside the dwell leaves nothing running", () => {
    const { result, unmount } = renderHook(() => useCopiedFlag());
    act(() => result.current.markCopied());
    expect(vi.getTimerCount()).toBe(1);

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });

  it("restarts the dwell when copied again before it elapses", () => {
    const { result } = renderHook(() => useCopiedFlag());

    act(() => result.current.markCopied());
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    act(() => result.current.markCopied());
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(result.current.copied).toBe(true);
  });
});
