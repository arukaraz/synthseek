import { QueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { beforeEach, describe, expect, it } from "vitest";

import { SubscriptionEventType, type ActiveRelease, type ReleaseProgressPayload } from "@api/__generated__/types";
import { trpc } from "@utils/trpc";

import { handleReleaseProgress } from "../releaseProgress";

function release(overrides: Partial<ActiveRelease> = {}): ActiveRelease {
  return {
    userId: "ana",
    source: "torrent",
    releaseKey: "album-a",
    title: "Artist - Album",
    state: "fetching",
    percent: 10,
    doneBytes: 10,
    totalBytes: 100,
    etaMinutes: 3,
    albumIds: ["album-1"],
    trackRequestIds: ["track-1"],
    ...overrides,
  };
}

function event(payload: Partial<ReleaseProgressPayload> & { release: ActiveRelease | null }): ReleaseProgressPayload {
  return {
    eventType: SubscriptionEventType.ReleaseProgress,
    userId: "ana",
    source: "torrent",
    releaseKey: "album-a",
    ...payload,
  };
}

const queryKey = getQueryKey(trpc.requests.activeReleases, undefined, "query");
let queryClient: QueryClient;

function cached(): ActiveRelease[] | undefined {
  return queryClient.getQueryData<ActiveRelease[]>(queryKey);
}

beforeEach(() => {
  queryClient = new QueryClient();
});

describe("handleReleaseProgress", () => {
  it("replaces the release in place as it moves", () => {
    const other = release({ releaseKey: "album-b" });
    queryClient.setQueryData(queryKey, [release(), other]);

    handleReleaseProgress(event({ release: release({ percent: 62 }) }), queryClient);

    expect(cached()?.map((entry) => [entry.releaseKey, entry.percent])).toEqual([
      ["album-a", 62],
      ["album-b", 10],
    ]);
  });

  it("adds a release it has not seen, and drops one that is gone", () => {
    queryClient.setQueryData(queryKey, [release()]);

    handleReleaseProgress(event({ releaseKey: "album-b", release: release({ releaseKey: "album-b" }) }), queryClient);
    handleReleaseProgress(event({ release: null }), queryClient);

    expect(cached()?.map((entry) => entry.releaseKey)).toEqual(["album-b"]);
  });

  it("keeps another listener's copy of the same release apart", () => {
    queryClient.setQueryData(queryKey, [release(), release({ userId: "bo" })]);

    handleReleaseProgress(event({ release: null }), queryClient);

    expect(cached()?.map((entry) => entry.userId)).toEqual(["bo"]);
  });

  it("leaves the cache untouched when a gone release was never in it, and never seeds an unloaded one", () => {
    const loaded = [release()];
    queryClient.setQueryData(queryKey, loaded);
    handleReleaseProgress(event({ releaseKey: "missing", release: null }), queryClient);
    expect(cached()).toBe(loaded);

    queryClient.clear();
    handleReleaseProgress(event({ release: release() }), queryClient);
    expect(cached()).toBeUndefined();
  });
});
