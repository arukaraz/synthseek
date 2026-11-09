import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { isChromeCollapsed, setChromeCollapsed } from "@hooks/ui/useChromeCollapsed";

import { useShelfCollapse } from "../useShelfCollapse";

function listOf(overflow: number): HTMLElement {
  const node = document.createElement("div");
  Object.defineProperty(node, "clientHeight", { configurable: true, value: 500 });
  Object.defineProperty(node, "scrollHeight", { configurable: true, value: 500 + overflow });
  return node;
}

function scrollTo(node: HTMLElement, top: number): void {
  act(() => {
    node.scrollTop = top;
    node.dispatchEvent(new Event("scroll"));
  });
}

afterEach(() => {
  setChromeCollapsed(false);
});

describe("useShelfCollapse", () => {
  it("folds the chrome once a long list scrolls down, and keeps it folded on the way back up", () => {
    const list = listOf(2000);
    const { result } = renderHook(() => useShelfCollapse(list, true));
    expect(result.current).toBe(false);

    scrollTo(list, 400);
    expect(result.current).toBe(true);
    expect(isChromeCollapsed()).toBe(true);

    scrollTo(list, 50);
    expect(result.current).toBe(true);
  });

  it("brings everything back only at the very top", () => {
    const list = listOf(2000);
    const { result } = renderHook(() => useShelfCollapse(list, true));
    scrollTo(list, 400);

    scrollTo(list, 0);

    expect(result.current).toBe(false);
    expect(isChromeCollapsed()).toBe(false);
  });

  it("ignores a nudge too small to mean a scroll", () => {
    const list = listOf(2000);
    const { result } = renderHook(() => useShelfCollapse(list, true));

    scrollTo(list, 10);

    expect(result.current).toBe(false);
  });

  it("keeps a list too short to stay scrollable once folded from folding at all", () => {
    const list = listOf(200);
    const { result } = renderHook(() => useShelfCollapse(list, true));

    scrollTo(list, 150);

    expect(result.current).toBe(false);
  });

  it("stays out of the way on a wider screen", () => {
    const list = listOf(2000);
    const { result } = renderHook(() => useShelfCollapse(list, false));

    scrollTo(list, 400);

    expect(result.current).toBe(false);
    expect(isChromeCollapsed()).toBe(false);
  });

  it("gives the header back when the list goes away", () => {
    const list = listOf(2000);
    const { unmount } = renderHook(() => useShelfCollapse(list, true));
    scrollTo(list, 400);

    unmount();

    expect(isChromeCollapsed()).toBe(false);
  });
});
