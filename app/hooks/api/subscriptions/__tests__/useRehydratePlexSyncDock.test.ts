import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { handlePlexSyncAllProgress } from "../handlers/requests/plexSyncAllProgress";
import { dismissDockJob, resetDockStore, seedPlexSyncDockJob, useDockJobs } from "../shared/progressDock";
import type { DockJob } from "../shared/progressDock";
import { useRehydratePlexSyncDock } from "../useRehydratePlexSyncDock";
import { SubscriptionEventType, type PlexSyncAllProgressPayload } from "@api/__generated__/types";

interface PlexSyncItem {
  id: string;
  name: string;
  state: "pending" | "done" | "failed";
}

const queryState = vi.hoisted<{ data: PlexSyncItem[] | undefined }>(() => ({ data: undefined }));

const spies = vi.hoisted(() => ({ setData: vi.fn(), invalidate: vi.fn(), invalidateItems: vi.fn() }));

vi.mock("@utils/trpc", () => ({
  trpc: {
    requests: {
      getPlexSyncAllItems: {
        useQuery: () => ({ data: queryState.data }),
      },
    },
    useUtils: () => ({
      requests: {
        getPlexSyncAllState: { setData: spies.setData },
        getPlexSyncAllItems: { invalidate: spies.invalidateItems },
        getAll: { invalidate: spies.invalidate },
      },
    }),
  },
}));

function plexJob(): DockJob | undefined {
  const { result } = renderHook(() => useDockJobs());
  return result.current.find((job) => job.id === "plex-sync");
}

function progressEvent(current: { id: string; ok: boolean }): PlexSyncAllProgressPayload {
  return {
    eventType: SubscriptionEventType.PlexSyncAllProgress,
    phase: "progress",
    synced: 2,
    total: 3,
    current,
  };
}

beforeEach(() => {
  resetDockStore();
  queryState.data = undefined;
  spies.setData.mockReset();
  spies.invalidate.mockReset();
});

afterEach(() => {
  resetDockStore();
  vi.clearAllMocks();
});

describe("useRehydratePlexSyncDock", () => {
  it("seeds the dock with the real playlist rows and the outcome each already reached", () => {
    queryState.data = [
      { id: "pl_a", name: "Road Trip", state: "done" },
      { id: "pl_b", name: "Focus", state: "failed" },
      { id: "pl_c", name: "Chill", state: "pending" },
    ];

    renderHook(() => useRehydratePlexSyncDock());

    const job = plexJob();
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

    renderHook(() => useRehydratePlexSyncDock());
    handlePlexSyncAllProgress(progressEvent({ id: "pl_b", ok: true }), {
      requests: {
        getPlexSyncAllState: { setData: spies.setData },
        getPlexSyncAllItems: { invalidate: spies.invalidateItems },
        getAll: { invalidate: spies.invalidate },
      },
    });

    expect(plexJob()?.items.find((item) => item.key === "pl_b")?.state).toBe("done");
  });

  it("does nothing while no sync-all run is in flight", () => {
    queryState.data = [];

    renderHook(() => useRehydratePlexSyncDock());

    expect(plexJob()).toBeUndefined();
  });

  it("does nothing while the query has no data yet", () => {
    queryState.data = undefined;

    renderHook(() => useRehydratePlexSyncDock());

    expect(plexJob()).toBeUndefined();
  });

  it("leaves a job the live stream already seeded untouched", () => {
    seedPlexSyncDockJob([
      { id: "pl_a", name: "Road Trip", state: "done" },
      { id: "pl_b", name: "Focus", state: "pending" },
    ]);
    queryState.data = [
      { id: "pl_a", name: "Road Trip", state: "pending" },
      { id: "pl_b", name: "Focus", state: "pending" },
    ];

    renderHook(() => useRehydratePlexSyncDock());

    expect(plexJob()?.items.find((item) => item.key === "pl_a")?.state).toBe("done");
  });

  it("does not resurrect a card the user dismissed", () => {
    seedPlexSyncDockJob([{ id: "pl_a", name: "Road Trip", state: "pending" }]);
    dismissDockJob("plex-sync");
    queryState.data = [{ id: "pl_a", name: "Road Trip", state: "pending" }];

    renderHook(() => useRehydratePlexSyncDock());

    expect(plexJob()).toBeUndefined();
  });

  it("is idempotent across re-renders of the same data", () => {
    queryState.data = [{ id: "pl_a", name: "Road Trip", state: "pending" }];

    const { rerender } = renderHook(() => useRehydratePlexSyncDock());
    const seededAt = plexJob()?.updatedAt;
    rerender();

    expect(plexJob()?.updatedAt).toBe(seededAt);
  });
});
