import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import enLibrary from "@modules/i18n/messages/en/library.json";
import { renderWithProviders, screen } from "@test/test-utils";

import { LibraryLoadMore } from "../LibraryLoadMore";
import type { LibraryLoadMoreProps } from "../types";

let observers: MockIntersectionObserver[] = [];

class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: readonly number[] = [];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = () => [];
  private callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    observers.push(this);
  }

  emit(isIntersecting: boolean) {
    const rect = new DOMRect();
    this.callback(
      [
        {
          isIntersecting,
          boundingClientRect: rect,
          intersectionRect: rect,
          intersectionRatio: isIntersecting ? 1 : 0,
          rootBounds: null,
          target: document.body,
          time: 0,
        },
      ],
      this
    );
  }
}

function makeProps(overrides?: Partial<LibraryLoadMoreProps>): LibraryLoadMoreProps {
  return {
    scrollRoot: null,
    hasNextPage: true,
    isFetchingNextPage: false,
    fetchNextPage: vi.fn(),
    ...overrides,
  };
}

describe("LibraryLoadMore", () => {
  beforeEach(() => {
    observers = [];
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches the next page when the sentinel intersects and there is one", () => {
    const fetchNextPage = vi.fn();
    renderWithProviders(<LibraryLoadMore {...makeProps({ fetchNextPage })} />);

    expect(observers).toHaveLength(1);
    observers[0].emit(true);

    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it("does not fetch while the sentinel is out of view", () => {
    const fetchNextPage = vi.fn();
    renderWithProviders(<LibraryLoadMore {...makeProps({ fetchNextPage })} />);

    observers[0].emit(false);

    expect(fetchNextPage).not.toHaveBeenCalled();
  });

  it("does not observe, so cannot fetch, when there is no next page", () => {
    const fetchNextPage = vi.fn();
    const { container } = renderWithProviders(
      <LibraryLoadMore {...makeProps({ hasNextPage: false, fetchNextPage })} />
    );

    expect(observers).toHaveLength(0);
    expect(container.querySelector("[aria-hidden='true']")).toBeNull();
    expect(fetchNextPage).not.toHaveBeenCalled();
  });

  it("does not fetch again while a page is already being fetched", () => {
    const fetchNextPage = vi.fn();
    renderWithProviders(<LibraryLoadMore {...makeProps({ isFetchingNextPage: true, fetchNextPage })} />);

    expect(observers).toHaveLength(0);
    expect(fetchNextPage).not.toHaveBeenCalled();
  });

  it("shows the spinner while a page is being fetched", () => {
    renderWithProviders(<LibraryLoadMore {...makeProps({ isFetchingNextPage: true })} />);

    expect(screen.getByRole("status")).toHaveTextContent(enLibrary.page.loading);
  });

  it("shows no spinner when idle", () => {
    renderWithProviders(<LibraryLoadMore {...makeProps()} />);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
