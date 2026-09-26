import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { handlePlaylistSyncAllProgress } from "../handlers/requests/playlistSyncAllProgress";
import { dismissDockJob, resetDockStore, seedPlaylistSyncDockJob, useDockJobs } from "../shared/progressDock";
import type { DockJob } from "../shared/progressDock";
import { useRehydratePlaylistSyncDock } from "../useRehydratePlaylistSyncDock";
import { SubscriptionEventType, type PlaylistSyncAllProgressPayload } from "@api/__generated__/types";

interface PlexSyncItem {
  id: string;
  name: string;
  state: "pending" | "done" | "failed";
}

const queryState = vi.hoisted<{ data: PlexSyncItem[] | undefined; server: string | null }>(() => ({
  data: undefined,
  server: "plex",
}));

const spies = vi.hoisted(() => ({ setData: vi.fn(), invalidate: vi.fn(), invalidateItems: vi.fn() }));

vi.mock("@utils/trpc", () => ({
  trpc: {
    requests: {
      getPlaylistSyncAllItems: {
        useQuery: () => ({ data: queryState.data }),
      },
      getPlaylistSyncAllState: {
        useQuery: () => ({ data: { running: true, server: queryState.server, synced: 0, total: 0 } }),
      },
    },
    useUtils: () => ({
      requests: {
        getPlaylistSyncAllState: { setData: spies.setData },
        getPlaylistSyncAllItems: { invalidate: spies.invalidateItems },
        getAll: { invalidate: spies.invalidate },
        getRecentTracks: { invalidate: vi.fn() },
        getDetail: { invalidate: vi.fn() },
      },
    }),
  },
}));

function syncJob(): DockJob | undefined {
  const { result } = renderHook(() => useDockJobs());
  return result.current.find((job) => job.id === "playlist-sync");
}

const VIEWER_ID = "u_self";

function progressEvent(current: { id: string; ok: boolean }, userId = VIEWER_ID): PlaylistSyncAllProgressPayload {
  return {
    eventType: SubscriptionEventType.PlaylistSyncAllProgress,
    userId,
    server: "plex",
    phase: "progress",
    synced: 2,
    total: 3,
    current,
  };
}

beforeEach(() => {
  resetDockStore();
  queryState.data = undefined;
  queryState.server = "plex";
  spies.setData.mockReset();
  spies.invalidate.mockReset();
});

afterEach(() => {
  resetDockStore();
  vi.clearAllMocks();
});

describe("useRehydratePlaylistSyncDock", () => {
  it("seeds the dock with the real playlist rows and the outcome each already reached", () => {
    queryState.data = [
      { id: "pl_a", name: "Road Trip", state: "done" },
      { id: "pl_b", name: "Focus", state: "failed" },
      { id: "pl_c", name: "Chill", state: "pending" },
    ];

    renderHook(() => useRehydratePlaylistSyncDock());

    const job = syncJob();
    expect(job?.status).toBe("running");
    expect(job?.items).toEqual([
      { key: "pl_a", name: "Road Trip", state: "done" },
      { key: "pl_b", name: "Focus", state: "failed" },
      { key: "pl_c", name: "Chill", state: "pending" },
    ]);
  });

  it("lets a later progress event advance a rehydrated row instead of freezing it", () => {
    queryState.data = [
      { id: "pl_a", name: "Road Trip", state: "done" },
      { id: "pl_b", name: "Focus", state: "pending" },
      { id: "pl_c", name: "Chill", state: "pending" },
    ];

    renderHook(() => useRehydratePlaylistSyncDock());
    handlePlaylistSyncAllProgress(
      progressEvent({ id: "pl_b", ok: true }),
      {
        requests: {
          getPlaylistSyncAllState: { setData: spies.setData },
          getPlaylistSyncAllItems: { invalidate: spies.invalidateItems },
          getAll: { invalidate: spies.invalidate },
          getRecentTracks: { invalidate: vi.fn() },
          getDetail: { invalidate: vi.fn() },
        },
      },
      VIEWER_ID
    );

    expect(syncJob()?.items.find((item) => item.key === "pl_b")?.state).toBe("done");
  });

  it("lets another user's run advance the rows it rehydrated for this session", () => {
    queryState.data = [
      { id: "pl_a", name: "Road Trip", state: "done" },
      { id: "pl_b", name: "Focus", state: "pending" },
      { id: "pl_c", name: "Chill", state: "pending" },
    ];

    renderHook(() => useRehydratePlaylistSyncDock());
    handlePlaylistSyncAllProgress(
      progressEvent({ id: "pl_b", ok: true }, "u_other"),
      {
        requests: {
          getPlaylistSyncAllState: { setData: spies.setData },
          getPlaylistSyncAllItems: { invalidate: spies.invalidateItems },
          getAll: { invalidate: spies.invalidate },
          getRecentTracks: { invalidate: vi.fn() },
          getDetail: { invalidate: vi.fn() },
        },
      },
      VIEWER_ID
    );

    expect(syncJob()?.items.find((item) => item.key === "pl_b")?.state).toBe("done");
  });

  it("names the run's server on the card it seeds", () => {
    queryState.server = "navidrome";
    queryState.data = [{ id: "pl_a", name: "Road Trip", state: "pending" }];

    renderHook(() => useRehydratePlaylistSyncDock());

    expect(syncJob()?.provider).toBe("navidrome");
  });

  it("waits for the run's server before seeding a card", () => {
    queryState.server = null;
    queryState.data = [{ id: "pl_a", name: "Road Trip", state: "pending" }];

    renderHook(() => useRehydratePlaylistSyncDock());

    expect(syncJob()).toBeUndefined();
  });

  it("does nothing while no sync-all run is in flight", () => {
    queryState.data = [];

    renderHook(() => useRehydratePlaylistSyncDock());

    expect(syncJob()).toBeUndefined();
  });

  it("does nothing while the query has no data yet", () => {
    queryState.data = undefined;

    renderHook(() => useRehydratePlaylistSyncDock());

    expect(syncJob()).toBeUndefined();
  });

  it("leaves a job the live stream already seeded untouched", () => {
    seedPlaylistSyncDockJob("plex", [
      { id: "pl_a", name: "Road Trip", state: "done" },
      { id: "pl_b", name: "Focus", state: "pending" },
    ]);
    queryState.data = [
      { id: "pl_a", name: "Road Trip", state: "pending" },
      { id: "pl_b", name: "Focus", state: "pending" },
    ];

    renderHook(() => useRehydratePlaylistSyncDock());

    expect(syncJob()?.items.find((item) => item.key === "pl_a")?.state).toBe("done");
  });

  it("does not resurrect a card the user dismissed", () => {
    seedPlaylistSyncDockJob("plex", [{ id: "pl_a", name: "Road Trip", state: "pending" }]);
    dismissDockJob("playlist-sync");
    queryState.data = [{ id: "pl_a", name: "Road Trip", state: "pending" }];

    renderHook(() => useRehydratePlaylistSyncDock());

    expect(syncJob()).toBeUndefined();
  });

  it("is idempotent across re-renders of the same data", () => {
    queryState.data = [{ id: "pl_a", name: "Road Trip", state: "pending" }];

    const { rerender } = renderHook(() => useRehydratePlaylistSyncDock());
    const seededAt = syncJob()?.updatedAt;
    rerender();

    expect(syncJob()?.updatedAt).toBe(seededAt);
  });
});
