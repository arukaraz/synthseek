import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  invalidateRequestList,
  invalidateRequestListNow,
  resetRequestListInvalidation,
} from "../requestListInvalidation";

const invalidateAll = vi.fn();
const invalidateRecent = vi.fn();
const invalidateDetail = vi.fn();

const utils = {
  requests: {
    getAll: { invalidate: invalidateAll },
    getRecentTracks: { invalidate: invalidateRecent },
    getDetail: { invalidate: invalidateDetail },
  },
} as unknown as Parameters<typeof invalidateRequestList>[0];

beforeEach(() => {
  vi.useFakeTimers();
  resetRequestListInvalidation();
  invalidateAll.mockClear();
  invalidateRecent.mockClear();
  invalidateDetail.mockClear();
});

afterEach(() => {
  resetRequestListInvalidation();
  vi.useRealTimers();
});

describe("invalidateRequestList", () => {
  it("refetches immediately on the first call", () => {
    invalidateRequestList(utils);

    expect(invalidateAll).toHaveBeenCalledTimes(1);
  });

  it("collapses a burst inside the window into ONE trailing refetch, so the last event is never lost", () => {
    invalidateRequestList(utils);
    expect(invalidateAll).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);
    for (let i = 0; i < 25; i++) invalidateRequestList(utils);

    expect(invalidateAll).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(899);
    expect(invalidateAll).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1);
    expect(invalidateAll).toHaveBeenCalledTimes(2);
  });

  it("refetches again once the window has elapsed", () => {
    invalidateRequestList(utils);
    vi.advanceTimersByTime(1000);
    invalidateRequestList(utils);

    expect(invalidateAll).toHaveBeenCalledTimes(2);
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

    vi.advanceTimersByTime(1000);
    expect(invalidateAll).toHaveBeenCalledTimes(2);
  });
});
