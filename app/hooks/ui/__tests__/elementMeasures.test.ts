import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useElementHeight } from "../useElementHeight";
import { useOverflowsX } from "../useOverflowsX";

const observers: FakeResizeObserver[] = [];

class FakeResizeObserver {
  observed: Element[] = [];
  disconnected = false;

  constructor(private readonly callback: () => void) {
    observers.push(this);
  }

  observe(target: Element): void {
    this.observed.push(target);
  }

  unobserve(): void {}

  disconnect(): void {
    this.disconnected = true;
  }

  fire(): void {
    this.callback();
  }
}

function boxOf(sizes: { scrollWidth?: number; clientWidth?: number; offsetHeight?: number }): HTMLDivElement {
  const node = document.createElement("div");
  node.appendChild(document.createElement("table"));
  for (const [key, value] of Object.entries(sizes)) {
    Object.defineProperty(node, key, { configurable: true, get: () => value });
  }
  return node;
}

beforeEach(() => {
  observers.length = 0;
  vi.stubGlobal("ResizeObserver", FakeResizeObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useOverflowsX", () => {
  it("reports a box whose content is wider than it, watching the content too", () => {
    const { result } = renderHook(() => useOverflowsX<HTMLDivElement>());
    const node = boxOf({ scrollWidth: 480, clientWidth: 400 });

    act(() => result.current[0](node));
    act(() => observers[0]?.fire());

    expect(result.current[1]).toBe(true);
    expect(observers[0]?.observed).toEqual([node, node.firstElementChild]);
  });

  it("reports a box its content fits", () => {
    const { result } = renderHook(() => useOverflowsX<HTMLDivElement>());

    act(() => result.current[0](boxOf({ scrollWidth: 800, clientWidth: 800 })));
    act(() => observers[0]?.fire());

    expect(result.current[1]).toBe(false);
  });

  it("forgets the overflow and stops watching once the box is gone", () => {
    const { result } = renderHook(() => useOverflowsX<HTMLDivElement>());
    act(() => result.current[0](boxOf({ scrollWidth: 480, clientWidth: 400 })));
    act(() => observers[0]?.fire());

    act(() => result.current[0](null));

    expect(result.current[1]).toBe(false);
    expect(observers[0]?.disconnected).toBe(true);
  });
});

describe("useElementHeight", () => {
  it("follows the element's height and drops to zero when it unmounts", () => {
    const { result } = renderHook(() => useElementHeight<HTMLDivElement>());
    const node = boxOf({ offsetHeight: 44 });

    act(() => result.current[0](node));
    act(() => observers[0]?.fire());
    expect(result.current[1]).toBe(44);

    act(() => result.current[0](null));
    expect(result.current[1]).toBe(0);
  });
});
