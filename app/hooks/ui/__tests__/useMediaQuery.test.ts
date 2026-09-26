import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useMediaQuery } from "../useMediaQuery";

interface FakeList {
  matches: boolean;
  listeners: Set<() => void>;
}

function installMatchMedia(initial: boolean): FakeList {
  const list: FakeList = { matches: initial, listeners: new Set() };
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn(() => ({
      get matches() {
        return list.matches;
      },
      addEventListener: (_type: string, listener: () => void) => list.listeners.add(listener),
      removeEventListener: (_type: string, listener: () => void) => list.listeners.delete(listener),
    })),
  });
  return list;
}

afterEach(() => {
  Reflect.deleteProperty(window, "matchMedia");
});

describe("useMediaQuery", () => {
  it("answers the fallback where the browser cannot evaluate media queries", () => {
    expect(renderHook(() => useMediaQuery("(max-width: 639px)")).result.current).toBe(false);
    expect(renderHook(() => useMediaQuery("(max-width: 639px)", true)).result.current).toBe(true);
  });

  it("answers whether the query matches and follows it when the viewport changes", () => {
    const list = installMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery("(max-width: 639px)"));
    expect(result.current).toBe(false);

    act(() => {
      list.matches = true;
      list.listeners.forEach((listener) => listener());
    });

    expect(result.current).toBe(true);
  });

  it("stops listening when the component goes away", () => {
    const list = installMatchMedia(true);
    const { unmount } = renderHook(() => useMediaQuery("(max-width: 639px)"));
    expect(list.listeners.size).toBe(1);

    unmount();

    expect(list.listeners.size).toBe(0);
  });
});
