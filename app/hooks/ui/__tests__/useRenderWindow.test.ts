import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useRenderWindow } from "../useRenderWindow";

function rows(count: number): string[] {
  return Array.from({ length: count }, (_, index) => `row-${index}`);
}

describe("useRenderWindow", () => {
  it("shows only the first step and reports there is more", () => {
    const { result } = renderHook(() => useRenderWindow(rows(25), "all", 10));

    expect(result.current.visible).toHaveLength(10);
    expect(result.current.hasMore).toBe(true);
  });

  it("grows by one step per load and stops when the list is exhausted", () => {
    const { result } = renderHook(() => useRenderWindow(rows(25), "all", 10));

    act(() => result.current.loadMore());
    expect(result.current.visible).toHaveLength(20);
    expect(result.current.hasMore).toBe(true);

    act(() => result.current.loadMore());
    expect(result.current.visible).toHaveLength(25);
    expect(result.current.hasMore).toBe(false);
  });

  it("reports no more when the list already fits in one step", () => {
    const { result } = renderHook(() => useRenderWindow(rows(4), "all", 10));

    expect(result.current.visible).toHaveLength(4);
    expect(result.current.hasMore).toBe(false);
  });

  it("goes back to the top of the list when the filter behind it changes", () => {
    const { result, rerender } = renderHook(({ key }) => useRenderWindow(rows(25), key, 10), {
      initialProps: { key: "all" },
    });

    act(() => result.current.loadMore());
    expect(result.current.visible).toHaveLength(20);

    rerender({ key: "failed" });
    expect(result.current.visible).toHaveLength(10);
  });

  it("holds its place when the same list is refetched underneath it", () => {
    const { result, rerender } = renderHook(({ items }) => useRenderWindow(items, "all", 10), {
      initialProps: { items: rows(25) },
    });

    act(() => result.current.loadMore());
    expect(result.current.visible).toHaveLength(20);

    rerender({ items: rows(25) });
    expect(result.current.visible).toHaveLength(20);
  });
});
