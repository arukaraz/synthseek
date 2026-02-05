import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "../useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial"));
    expect(result.current).toBe("initial");
  });

  it("updates value after default delay (300ms)", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: "initial" },
    });

    rerender({ value: "updated" });
    expect(result.current).toBe("initial");

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe("updated");
  });

  it("updates value after custom delay", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, { delay: 500 }), {
      initialProps: { value: "initial" },
    });

    rerender({ value: "updated" });
    expect(result.current).toBe("initial");

    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current).toBe("initial");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe("updated");
  });

  it("cancels pending update when value changes", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: "initial" },
    });

    rerender({ value: "first" });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    rerender({ value: "second" });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe("initial");

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe("second");
  });

  it("only persists the last value with rapid changes", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, { delay: 100 }), {
      initialProps: { value: "a" },
    });

    rerender({ value: "b" });
    rerender({ value: "c" });
    rerender({ value: "d" });
    rerender({ value: "final" });

    expect(result.current).toBe("a");

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe("final");
  });

  it("works with numbers", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: 0 },
    });

    rerender({ value: 42 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe(42);
  });

  it("works with objects", () => {
    const initialObj = { name: "initial" };
    const updatedObj = { name: "updated" };

    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: initialObj },
    });

    rerender({ value: updatedObj });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toEqual(updatedObj);
  });

  it("cleans up timer on unmount", () => {
    const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");
    const { unmount, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: "test" },
    });

    rerender({ value: "updated" });
    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });
});
