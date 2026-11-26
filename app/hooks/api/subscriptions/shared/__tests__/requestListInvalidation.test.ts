import { QueryClient } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  holdRequestListRefresh,
  holdRequestListRows,
  invalidateRequestList,
  invalidateRequestListNow,
  type RequestListRefreshDeps,
} from "../requestListInvalidation";
import { resetThrottledInvalidations } from "../throttledInvalidation";

const trim = vi.hoisted(() => vi.fn());

vi.mock("../../../queries/requests/requestListCache", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../queries/requests/requestListCache")>()),
  trimRequestListToFirstPage: trim,
}));

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
} as unknown as RequestListRefreshDeps["utils"];

const queryClient = new QueryClient();
const deps: RequestListRefreshDeps = { utils, queryClient };

beforeEach(() => {
  vi.useFakeTimers();
  resetThrottledInvalidations();
  trim.mockClear();
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
    invalidateRequestList(deps);

    expect(invalidateAll).toHaveBeenCalledTimes(1);
  });

  it("drops the loaded pages past the first before refetching, so a refresh costs one request", () => {
    invalidateRequestList(deps);

    expect(trim).toHaveBeenCalledWith(queryClient);
    expect(trim.mock.invocationCallOrder[0]).toBeLessThan(invalidateAll.mock.invocationCallOrder[0]);
  });

  it("keeps the loaded pages while the refresh is held", () => {
    const release = holdRequestListRefresh();
    invalidateRequestList(deps);

    expect(trim).not.toHaveBeenCalled();

    release();

    expect(trim).toHaveBeenCalledTimes(1);
  });

  it("holds only the list rows while scrolled, so counts, recent tracks and the detail stay live", () => {
    const release = holdRequestListRows();
    invalidateRequestList(deps);

    expect(trim).not.toHaveBeenCalled();
    expect(invalidateAll).not.toHaveBeenCalled();
    expect(invalidateSummary).toHaveBeenCalledTimes(1);
    expect(invalidateRecent).toHaveBeenCalledTimes(1);
    expect(invalidateDetail).toHaveBeenCalledTimes(1);

    release();

    expect(trim).toHaveBeenCalledTimes(1);
    expect(invalidateAll).toHaveBeenCalledTimes(1);
    expect(invalidateSummary).toHaveBeenCalledTimes(1);
  });

  it("holds the counts, recent tracks and detail too while a selection or dialog holds the refresh", () => {
    const release = holdRequestListRefresh();
    invalidateRequestList(deps);

    expect(invalidateSummary).not.toHaveBeenCalled();
    expect(invalidateRecent).not.toHaveBeenCalled();
    expect(invalidateDetail).not.toHaveBeenCalled();

    release();

    expect(invalidateSummary).toHaveBeenCalledTimes(1);
    expect(invalidateRecent).toHaveBeenCalledTimes(1);
    expect(invalidateDetail).toHaveBeenCalledTimes(1);
  });

  it("lets a reconnect resync refresh the counts while the rows are held", () => {
    const release = holdRequestListRows();
    invalidateRequestListNow(deps);

    expect(invalidateAll).not.toHaveBeenCalled();
    expect(invalidateSummary).toHaveBeenCalledTimes(1);

    release();
  });

  it("refreshes the summary counts together with the list", () => {
    invalidateRequestList(deps);

    expect(invalidateSummary).toHaveBeenCalledTimes(1);
  });

  it("collapses a burst inside the window into ONE trailing refetch, so the last event is never lost", () => {
    invalidateRequestList(deps);
    expect(invalidateAll).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);
    for (let i = 0; i < 25; i++) invalidateRequestList(deps);

    expect(invalidateAll).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(4899);
    expect(invalidateAll).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1);
    expect(invalidateAll).toHaveBeenCalledTimes(2);
  });

  it("refetches again once the five-second window has elapsed, and not before", () => {
    invalidateRequestList(deps);
    vi.advanceTimersByTime(1000);
    invalidateRequestList(deps);
    expect(invalidateAll).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(4000);
    expect(invalidateAll).toHaveBeenCalledTimes(2);
  });

  it("holds every refetch while a selection is held, then refetches once on release", () => {
    const release = holdRequestListRefresh();
    invalidateRequestList(deps);
    vi.advanceTimersByTime(20000);
    for (let i = 0; i < 5; i++) invalidateRequestList(deps);
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
    invalidateRequestList(deps);

    first();
    first();
    expect(invalidateAll).not.toHaveBeenCalled();

    second();
    expect(invalidateAll).toHaveBeenCalledTimes(1);
  });

  it("refreshes the recent-tracks strip alongside the list, since nothing else invalidates it", () => {
    invalidateRequestList(deps);

    expect(invalidateRecent).toHaveBeenCalledTimes(1);
  });

  it("refreshes the open container's detail too, since the split moved its tracks off the list query", () => {
    invalidateRequestList(deps);

    expect(invalidateDetail).toHaveBeenCalledTimes(1);
  });
});

describe("invalidateRequestListNow", () => {
  it("refetches immediately even inside the throttle window", () => {
    invalidateRequestList(deps);
    vi.advanceTimersByTime(10);

    invalidateRequestListNow(deps);

    expect(invalidateAll).toHaveBeenCalledTimes(2);
  });

  it("drops a pending trailing refetch it supersedes, so no redundant refetch lands afterwards", () => {
    invalidateRequestList(deps);
    vi.advanceTimersByTime(10);
    invalidateRequestList(deps);

    invalidateRequestListNow(deps);
    expect(invalidateAll).toHaveBeenCalledTimes(2);

    vi.advanceTimersByTime(5000);
    expect(invalidateAll).toHaveBeenCalledTimes(2);
  });

  it("opens a fresh window, so an immediately following repeating event is throttled", () => {
    invalidateRequestListNow(deps);
    invalidateRequestList(deps);

    expect(invalidateAll).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(5000);
    expect(invalidateAll).toHaveBeenCalledTimes(2);
  });
});
