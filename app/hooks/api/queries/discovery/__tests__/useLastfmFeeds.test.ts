import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

interface FeedEntry {
  integration: string;
  kind: string;
  result:
    | { kind: "ready"; generatedAt: string; candidates: { title: string }[] }
    | { kind: "empty"; generatedAt: string; reason: string }
    | { kind: "failed"; at: string; reason: string };
}

const api = vi.hoisted(() => ({
  feeds: undefined as FeedEntry[] | undefined,
  feedsLoading: false,
  feedsError: false,
  config: undefined as { integrations: { lastfm: { enabled: boolean; username: string | null } } } | undefined,
  configLoading: false,
  configError: false,
}));

vi.mock("@utils/trpc", () => ({
  trpc: {
    discovery: {
      getAllFeeds: {
        useQuery: () => ({ data: api.feeds, isLoading: api.feedsLoading, isError: api.feedsError }),
      },
    },
  },
}));

vi.mock("../useDiscoveryConfig", () => ({
  useDiscoveryConfig: () => ({ data: api.config, isLoading: api.configLoading, isError: api.configError }),
}));

import { useLastfmFeeds } from "../useLastfmFeeds";

function ready(kind: string, candidates: { title: string }[] = [{ title: "Digital Love" }]): FeedEntry {
  return { integration: "lastfm", kind, result: { kind: "ready", generatedAt: "2026-09-15T10:00:00Z", candidates } };
}

beforeEach(() => {
  api.feeds = undefined;
  api.feedsLoading = false;
  api.feedsError = false;
  api.config = { integrations: { lastfm: { enabled: true, username: "arukaraz" } } };
  api.configLoading = false;
  api.configError = false;
});

describe("useLastfmFeeds", () => {
  it("offers no feed before anything has been fetched", () => {
    const { result } = renderHook(() => useLastfmFeeds());

    expect(result.current.recentScrobbles).toBeNull();
    expect(result.current.topTracks).toBeNull();
  });

  it("hands the Last.fm settings back alongside the feeds", () => {
    const { result } = renderHook(() => useLastfmFeeds());

    expect(result.current.lfmConfig).toEqual({ enabled: true, username: "arukaraz" });
  });

  it("picks out the recent scrobbles and the lifetime top tracks", () => {
    api.feeds = [ready("recent-tracks"), ready("top-tracks-overall", [{ title: "Aerodynamic" }])];

    const { result } = renderHook(() => useLastfmFeeds());

    expect(result.current.recentScrobbles).toEqual({
      status: "ready",
      scrobbles: [{ title: "Digital Love" }],
      generatedAt: "2026-09-15T10:00:00Z",
    });
    expect(result.current.topTracks).toEqual({
      status: "ready",
      tracks: [{ title: "Aerodynamic" }],
      generatedAt: "2026-09-15T10:00:00Z",
    });
  });

  it("ignores a feed that belongs to another integration", () => {
    api.feeds = [{ ...ready("recent-tracks"), integration: "listenbrainz" }];

    const { result } = renderHook(() => useLastfmFeeds());

    expect(result.current.recentScrobbles).toBeNull();
  });

  it("carries the reason a feed came back empty, and when it was built", () => {
    api.feeds = [
      {
        integration: "lastfm",
        kind: "recent-tracks",
        result: { kind: "empty", generatedAt: "2026-09-15T10:00:00Z", reason: "no-scrobbles" },
      },
    ];

    const { result } = renderHook(() => useLastfmFeeds());

    expect(result.current.recentScrobbles).toEqual({
      status: "empty",
      scrobbles: [],
      reason: "no-scrobbles",
      generatedAt: "2026-09-15T10:00:00Z",
    });
  });

  it("reports a failed feed as empty with the reason, and no build time to show", () => {
    api.feeds = [
      {
        integration: "lastfm",
        kind: "top-tracks-overall",
        result: { kind: "failed", at: "2026-09-15T10:00:00Z", reason: "unauthorized" },
      },
    ];

    const { result } = renderHook(() => useLastfmFeeds());

    expect(result.current.topTracks).toEqual({ status: "empty", tracks: [], reason: "unauthorized" });
  });

  it("reports an empty failed scrobbles feed the same way", () => {
    api.feeds = [
      {
        integration: "lastfm",
        kind: "recent-tracks",
        result: { kind: "failed", at: "2026-09-15T10:00:00Z", reason: "rate-limited" },
      },
    ];

    const { result } = renderHook(() => useLastfmFeeds());

    expect(result.current.recentScrobbles).toEqual({ status: "empty", scrobbles: [], reason: "rate-limited" });
  });

  it("is loading while either the feeds or the settings are still coming", () => {
    api.feedsLoading = true;

    expect(renderHook(() => useLastfmFeeds()).result.current.isLoading).toBe(true);

    api.feedsLoading = false;
    api.configLoading = true;

    expect(renderHook(() => useLastfmFeeds()).result.current.isLoading).toBe(true);
  });

  it("has failed when either fetch failed", () => {
    api.feedsError = true;

    expect(renderHook(() => useLastfmFeeds()).result.current.isError).toBe(true);

    api.feedsError = false;
    api.configError = true;

    expect(renderHook(() => useLastfmFeeds()).result.current.isError).toBe(true);
  });

  it("offers no settings when the config has not arrived", () => {
    api.config = undefined;

    const { result } = renderHook(() => useLastfmFeeds());

    expect(result.current.lfmConfig).toBeUndefined();
  });
});
