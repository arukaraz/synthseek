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
  config: undefined as { integrations: { listenbrainz: { selectedKinds: string[] } } } | undefined,
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

import { useDiscoveryMixes } from "../useDiscoveryMixes";

beforeEach(() => {
  api.feeds = undefined;
  api.feedsLoading = false;
  api.feedsError = false;
  api.config = { integrations: { listenbrainz: { selectedKinds: ["daily-jams"] } } };
  api.configLoading = false;
  api.configError = false;
});

describe("useDiscoveryMixes", () => {
  it("offers no mixes before the settings have arrived", () => {
    api.config = undefined;

    const { result } = renderHook(() => useDiscoveryMixes());

    expect(result.current.mixes).toEqual([]);
    expect(result.current.lbConfig).toBeUndefined();
  });

  it("offers a placeholder for a mix the server has not built yet", () => {
    const { result } = renderHook(() => useDiscoveryMixes());

    expect(result.current.mixes).toEqual([{ kind: "daily-jams", status: "none", candidates: [] }]);
  });

  it("offers one mix per kind the listener chose, in that order", () => {
    api.config = { integrations: { listenbrainz: { selectedKinds: ["weekly-jams", "daily-jams"] } } };

    const { result } = renderHook(() => useDiscoveryMixes());

    expect(result.current.mixes.map((mix) => mix.kind)).toEqual(["weekly-jams", "daily-jams"]);
  });

  it("hands a built mix back with its tracks", () => {
    api.feeds = [
      {
        integration: "listenbrainz",
        kind: "daily-jams",
        result: { kind: "ready", generatedAt: "2026-09-15T06:00:00Z", candidates: [{ title: "Digital Love" }] },
      },
    ];

    const { result } = renderHook(() => useDiscoveryMixes());

    expect(result.current.mixes[0]).toEqual({
      kind: "daily-jams",
      status: "ready",
      candidates: [{ title: "Digital Love" }],
      generatedAt: "2026-09-15T06:00:00Z",
    });
  });

  it("calls a mix empty when nothing in it could be resolved to a track", () => {
    api.feeds = [
      {
        integration: "listenbrainz",
        kind: "daily-jams",
        result: { kind: "ready", generatedAt: "2026-09-15T06:00:00Z", candidates: [] },
      },
    ];

    const { result } = renderHook(() => useDiscoveryMixes());

    expect(result.current.mixes[0]).toEqual({
      kind: "daily-jams",
      status: "empty",
      candidates: [],
      emptyReason: "no-resolved",
      generatedAt: "2026-09-15T06:00:00Z",
    });
  });

  it("carries the reason the server gave for an empty mix", () => {
    api.feeds = [
      {
        integration: "listenbrainz",
        kind: "daily-jams",
        result: { kind: "empty", generatedAt: "2026-09-15T06:00:00Z", reason: "not-enough-listens" },
      },
    ];

    const { result } = renderHook(() => useDiscoveryMixes());

    expect(result.current.mixes[0]).toMatchObject({ status: "empty", emptyReason: "not-enough-listens" });
  });

  it("reports a failed mix as empty with the reason, and no build time to show", () => {
    api.feeds = [
      {
        integration: "listenbrainz",
        kind: "daily-jams",
        result: { kind: "failed", at: "2026-09-15T06:00:00Z", reason: "unreachable" },
      },
    ];

    const { result } = renderHook(() => useDiscoveryMixes());

    expect(result.current.mixes[0]).toEqual({
      kind: "daily-jams",
      status: "empty",
      candidates: [],
      emptyReason: "unreachable",
    });
  });

  it("ignores a feed built for another integration", () => {
    api.feeds = [
      {
        integration: "lastfm",
        kind: "daily-jams",
        result: { kind: "ready", generatedAt: "2026-09-15T06:00:00Z", candidates: [{ title: "Digital Love" }] },
      },
    ];

    const { result } = renderHook(() => useDiscoveryMixes());

    expect(result.current.mixes[0]?.status).toBe("none");
  });

  it("is loading while either the feeds or the settings are still coming", () => {
    api.feedsLoading = true;

    expect(renderHook(() => useDiscoveryMixes()).result.current.isLoading).toBe(true);

    api.feedsLoading = false;
    api.configLoading = true;

    expect(renderHook(() => useDiscoveryMixes()).result.current.isLoading).toBe(true);
  });

  it("has failed when either fetch failed", () => {
    api.feedsError = true;

    expect(renderHook(() => useDiscoveryMixes()).result.current.isError).toBe(true);

    api.feedsError = false;
    api.configError = true;

    expect(renderHook(() => useDiscoveryMixes()).result.current.isError).toBe(true);
  });
});
