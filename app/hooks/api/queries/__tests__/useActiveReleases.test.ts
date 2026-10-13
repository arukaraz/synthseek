import { describe, expect, it, vi } from "vitest";

import type { ActiveRelease } from "@api/__generated__/types";

import { useAlbumRelease, useRequestReleases, useTrackRelease } from "../useActiveReleases";

type Select = (releases: ActiveRelease[]) => unknown;

const query = vi.hoisted(() => ({ releases: [] as ActiveRelease[], loaded: true }));

vi.mock("@utils/trpc", () => ({
  trpc: {
    requests: {
      activeReleases: {
        useQuery: (_input: unknown, options: { select: Select }) => ({
          data: query.loaded ? options.select(query.releases) : undefined,
        }),
      },
    },
  },
}));

function release(releaseKey: string, albumIds: string[], trackRequestIds: string[]): ActiveRelease {
  return {
    userId: "user-1",
    source: "torrent",
    releaseKey,
    title: null,
    state: "fetching",
    percent: 0,
    doneBytes: 0,
    totalBytes: 0,
    etaMinutes: null,
    albumIds,
    trackRequestIds,
  };
}

const RELEASES = [release("a", ["album-1"], ["t1", "t2"]), release("b", ["album-2"], ["t3"])];

describe("the active release selectors", () => {
  it("picks the releases any of a request's tracks belong to", () => {
    query.releases = RELEASES;
    query.loaded = true;

    expect(useRequestReleases(["t2", "t9"]).map((entry) => entry.releaseKey)).toEqual(["a"]);
    expect(useRequestReleases(["t9"])).toEqual([]);
  });

  it("picks the release a track or an album belongs to, or none", () => {
    query.releases = RELEASES;
    query.loaded = true;

    expect(useTrackRelease("t3")?.releaseKey).toBe("b");
    expect(useTrackRelease("t9")).toBeNull();
    expect(useAlbumRelease("album-1")?.releaseKey).toBe("a");
    expect(useAlbumRelease("album-9")).toBeNull();
  });

  it("answers nothing before the list has loaded", () => {
    query.loaded = false;

    expect(useRequestReleases(["t1"])).toEqual([]);
    expect(useTrackRelease("t1")).toBeNull();
    expect(useAlbumRelease("album-1")).toBeNull();
  });
});
