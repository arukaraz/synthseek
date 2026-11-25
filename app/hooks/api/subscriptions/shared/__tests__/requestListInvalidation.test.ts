import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { holdRequestListRefresh, invalidateRequestList, invalidateRequestListNow } from "../requestListInvalidation";
import { resetThrottledInvalidations } from "../throttledInvalidation";

const invalidateAll = vi.fn();
const invalidateSummary = vi.fn();
const invalidateRecent = vi.fn();
const invalidateDetail = vi.fn();

const utils = {
  requests: {
    list: { invalidate: invalidateAll },
    summary: { invalidate: invalidateSummary },
    getRecentTracks: { invalidate: invalidateRecent },
    getDetail: { invalidate: invalidateDetail },
  },
} as unknown as Parameters<typeof invalidateRequestList>[0];

beforeEach(() => {
  vi.useFakeTimers();
  resetThrottledInvalidations();
  invalidateAll.mockClear();
  invalidateSummary.mockClear();
  invalidateRecent.mockClear();
  invalidateDetail.mockClear();
});

afterEach(() => {
  resetThrottledInvalidations();
  vi.useRealTimers();
});

describe("invalidateRequestList", () => {
  it("refetches immediately on the first call", () => {
    invalidateRequestList(utils);

    expect(invalidateAll).toHaveBeenCalledTimes(1);
  });

  it("refreshes the summary counts together with the list", () => {
    invalidateRequestList(utils);

    expect(invalidateSummary).toHaveBeenCalledTimes(1);
  });

  it("collapses a burst inside the window into ONE trailing refetch, so the last event is never lost", () => {
    invalidateRequestList(utils);
    expect(invalidateAll).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);
    for (let i = 0; i < 25; i++) invalidateRequestList(utils);

    expect(invalidateAll).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(4899);
    expect(invalidateAll).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1);
    expect(invalidateAll).toHaveBeenCalledTimes(2);
  });

  it("refetches again once the five-second window has elapsed, and not before", () => {
    invalidateRequestList(utils);
    vi.advanceTimersByTime(1000);
    invalidateRequestList(utils);
    expect(invalidateAll).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(4000);
    expect(invalidateAll).toHaveBeenCalledTimes(2);
  });

  it("holds every refetch while a selection is held, then refetches once on release", () => {
    const release = holdRequestListRefresh();
    invalidateRequestList(utils);
    vi.advanceTimersByTime(20000);
    for (let i = 0; i < 5; i++) invalidateRequestList(utils);
    vi.advanceTimersByTime(20000);

    expect(invalidateAll).not.toHaveBeenCalled();

    release();

    expect(invalidateAll).toHaveBeenCalledTimes(1);
  });

  it("does not refetch on release when nothing arrived during the hold", () => {
    const release = holdRequestListRefresh();
    release();

    expect(invalidateAll).not.toHaveBeenCalled();
  });

  it("waits for the last of two overlapping holds, and a repeated release counts once", () => {
    const first = holdRequestListRefresh();
    const second = holdRequestListRefresh();
    invalidateRequestList(utils);

    first();
    first();
    expect(invalidateAll).not.toHaveBeenCalled();

    second();
    expect(invalidateAll).toHaveBeenCalledTimes(1);
  });

  it("refreshes the recent-tracks strip alongside the list, since nothing else invalidates it", () => {
    invalidateRequestList(utils);

    expect(invalidateRecent).toHaveBeenCalledTimes(1);
  });

  it("refreshes the open container's detail too, since the split moved its tracks off the list query", () => {
    invalidateRequestList(utils);

    expect(invalidateDetail).toHaveBeenCalledTimes(1);
  });
});

describe("invalidateRequestListNow", () => {
  it("refetches immediately even inside the throttle window", () => {
    invalidateRequestList(utils);
    vi.advanceTimersByTime(10);

    invalidateRequestListNow(utils);

    expect(invalidateAll).toHaveBeenCalledTimes(2);
  });

  it("drops a pending trailing refetch it supersedes, so no redundant refetch lands afterwards", () => {
    invalidateRequestList(utils);
    vi.advanceTimersByTime(10);
    invalidateRequestList(utils);

    invalidateRequestListNow(utils);
    expect(invalidateAll).toHaveBeenCalledTimes(2);

    vi.advanceTimersByTime(5000);
    expect(invalidateAll).toHaveBeenCalledTimes(2);
  });

  it("opens a fresh window, so an immediately following repeating event is throttled", () => {
    invalidateRequestListNow(utils);
    invalidateRequestList(utils);

    expect(invalidateAll).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(5000);
    expect(invalidateAll).toHaveBeenCalledTimes(2);
  });
});
