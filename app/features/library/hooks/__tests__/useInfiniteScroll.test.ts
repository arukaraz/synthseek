import { render } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useInfiniteScroll } from "../useInfiniteScroll";
import type { UseInfiniteScrollArgs } from "../../types";

interface ObserverInstance {
  callback: IntersectionObserverCallback;
  options: IntersectionObserverInit | undefined;
  observe: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
}

let instances: ObserverInstance[] = [];

class MockIntersectionObserver {
  callback: IntersectionObserverCallback;
  options: IntersectionObserverInit | undefined;
  observe = vi.fn();
  disconnect = vi.fn();

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.options = options;
    instances.push(this);
  }
}

function lastObserver(): ObserverInstance {
  return instances[instances.length - 1];
}

function triggerIntersect(observer: ObserverInstance, isIntersecting: boolean) {
  const entry = { isIntersecting } as IntersectionObserverEntry;
  observer.callback([entry], observer as unknown as IntersectionObserver);
}

function Harness(args: Omit<UseInfiniteScrollArgs, "root">) {
  const sentinelRef = useInfiniteScroll({ root: null, ...args });
  return createElement("div", { ref: sentinelRef, "data-testid": "sentinel" });
}

function renderScroll(args: Omit<UseInfiniteScrollArgs, "root">) {
  return render(createElement(Harness, args));
}

describe("useInfiniteScroll", () => {
  beforeEach(() => {
    instances = [];
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("observes the sentinel and calls onLoadMore when it intersects", () => {
    const onLoadMore = vi.fn();
    renderScroll({ hasNextPage: true, isFetchingNextPage: false, onLoadMore });

    expect(lastObserver().observe).toHaveBeenCalledTimes(1);
    triggerIntersect(lastObserver(), true);
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it("ignores a non-intersecting entry", () => {
    const onLoadMore = vi.fn();
    renderScroll({ hasNextPage: true, isFetchingNextPage: false, onLoadMore });

    triggerIntersect(lastObserver(), false);
    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it("does not observe while a fetch is already in flight", () => {
    const onLoadMore = vi.fn();
    renderScroll({ hasNextPage: true, isFetchingNextPage: true, onLoadMore });

    expect(instances).toHaveLength(0);
    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it("does not observe when there is no next page", () => {
    const onLoadMore = vi.fn();
    renderScroll({ hasNextPage: false, isFetchingNextPage: false, onLoadMore });

    expect(instances).toHaveLength(0);
  });

  it("passes the configured root margin to the observer", () => {
    renderScroll({ hasNextPage: true, isFetchingNextPage: false, onLoadMore: vi.fn() });

    expect(lastObserver().options?.rootMargin).toBe("200px");
  });

  it("disconnects the observer on unmount", () => {
    const { unmount } = renderScroll({ hasNextPage: true, isFetchingNextPage: false, onLoadMore: vi.fn() });
    const observer = lastObserver();

    unmount();
    expect(observer.disconnect).toHaveBeenCalledTimes(1);
  });
});
