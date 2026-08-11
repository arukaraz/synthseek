import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { SubscriptionEventType, type PlexSyncAllProgressPayload } from "@api/__generated__/types";
import { trpc } from "@utils/trpc";
import { handlePlexSyncAllProgress } from "../plexSyncAllProgress";
import { subscribePlexSyncAll, type PlexSyncAllUpdate } from "../../../shared/plexSyncAll";
import { dismissDockJob, resetDockStore, seedPlexSyncDockJob, useDockJobs } from "../../../shared/progressDock";
import type { DockJob } from "../../../shared/progressDock";

const spies = vi.hoisted(() => ({
  setData: vi.fn(),
  invalidate: vi.fn(),
  invalidateItems: vi.fn(),
}));

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({
      requests: {
        getPlexSyncAllState: { setData: spies.setData },
        getPlexSyncAllItems: { invalidate: spies.invalidateItems },
        getAll: { invalidate: spies.invalidate },
      },
    }),
  },
}));

function makeEvent(overrides: Partial<PlexSyncAllProgressPayload>): PlexSyncAllProgressPayload {
  return {
    eventType: SubscriptionEventType.PlexSyncAllProgress,
    phase: "progress",
    synced: 2,
    total: 8,
    ...overrides,
  };
}

function readJobs(): DockJob[] {
  const { result } = renderHook(() => useDockJobs());
  return result.current;
}

function plexJob(): DockJob | undefined {
  return readJobs().find((job) => job.id === "plex-sync");
}

beforeEach(() => {
  spies.setData.mockReset();
  spies.invalidate.mockReset();
  spies.invalidateItems.mockReset();
  resetDockStore();
});

describe("handlePlexSyncAllProgress", () => {
  it("emits the update to subscribers of the shared bus", () => {
    const received: PlexSyncAllUpdate[] = [];
    const unsubscribe = subscribePlexSyncAll((u) => received.push(u));
    const utils = trpc.useUtils();

    handlePlexSyncAllProgress(makeEvent({ phase: "progress", synced: 3, total: 8 }), utils);

    expect(received).toEqual([{ phase: "progress", synced: 3, total: 8, failed: undefined }]);
    unsubscribe();
  });

  it("seeds the query state as running while in progress", () => {
    const utils = trpc.useUtils();

    handlePlexSyncAllProgress(makeEvent({ phase: "progress", synced: 4, total: 10 }), utils);

    expect(spies.setData).toHaveBeenCalledWith(undefined, { running: true, synced: 4, total: 10 });
    expect(spies.invalidate).not.toHaveBeenCalled();
  });

  it("marks not running and invalidates the list on completion", () => {
    const utils = trpc.useUtils();

    handlePlexSyncAllProgress(makeEvent({ phase: "complete", synced: 8, total: 8, failed: 1 }), utils);

    expect(spies.setData).toHaveBeenCalledWith(undefined, { running: false, synced: 8, total: 8 });
    expect(spies.invalidate).toHaveBeenCalledTimes(1);
  });

  it("seeds the dock from the named items on start", () => {
    const utils = trpc.useUtils();
    handlePlexSyncAllProgress(
      makeEvent({
        phase: "start",
        synced: 0,
        total: 2,
        items: [
          { id: "p1", name: "Road Trip" },
          { id: "p2", name: "Focus" },
        ],
      }),
      utils
    );

    const job = plexJob();
    expect(job?.kind).toBe("plex-sync");
    expect(job?.items.map((item) => item.name)).toEqual(["Road Trip", "Focus"]);
  });

  it("marks an item done or failed per progress tick", () => {
    const utils = trpc.useUtils();
    handlePlexSyncAllProgress(
      makeEvent({
        phase: "start",
        synced: 0,
        total: 2,
        items: [
          { id: "p1", name: "Road Trip" },
          { id: "p2", name: "Focus" },
        ],
      }),
      utils
    );
    handlePlexSyncAllProgress(
      makeEvent({ phase: "progress", synced: 1, total: 2, current: { id: "p1", ok: true } }),
      utils
    );
    handlePlexSyncAllProgress(
      makeEvent({ phase: "progress", synced: 1, total: 2, current: { id: "p2", ok: false } }),
      utils
    );

    const job = plexJob();
    expect(job?.items.find((item) => item.key === "p1")?.state).toBe("done");
    expect(job?.items.find((item) => item.key === "p2")?.state).toBe("failed");
  });

  it("sets a partial status when some synced and some failed", () => {
    const utils = trpc.useUtils();
    handlePlexSyncAllProgress(
      makeEvent({
        phase: "start",
        synced: 0,
        total: 2,
        items: [
          { id: "p1", name: "A" },
          { id: "p2", name: "B" },
        ],
      }),
      utils
    );
    handlePlexSyncAllProgress(makeEvent({ phase: "complete", synced: 1, total: 2, failed: 1 }), utils);

    expect(plexJob()?.status).toBe("partial");
  });

  it("advances the rehydrated row a progress event names after a late join", () => {
    const utils = trpc.useUtils();
    seedPlexSyncDockJob([
      { id: "pl_1", name: "Road Trip", state: "done" },
      { id: "pl_2", name: "Focus", state: "pending" },
      { id: "pl_3", name: "Chill", state: "pending" },
    ]);

    handlePlexSyncAllProgress(
      makeEvent({ phase: "progress", synced: 2, total: 3, current: { id: "pl_2", ok: true } }),
      utils
    );

    const job = plexJob();
    expect(job?.items.find((item) => item.key === "pl_1")?.state).toBe("done");
    expect(job?.items.find((item) => item.key === "pl_2")?.state).toBe("done");
    expect(job?.items.find((item) => item.key === "pl_3")?.state).toBe("pending");
  });

  it("does not fabricate placeholder rows for a late-joining tab with no rehydrated job", () => {
    const utils = trpc.useUtils();
    handlePlexSyncAllProgress(
      makeEvent({ phase: "progress", synced: 1, total: 3, current: { id: "pl_1", ok: true } }),
      utils
    );

    expect(plexJob()).toBeUndefined();
  });

  it("asks the server for the in-flight rows when a progress event finds no dock job", () => {
    const utils = trpc.useUtils();
    handlePlexSyncAllProgress(
      makeEvent({ phase: "progress", synced: 1, total: 3, current: { id: "pl_1", ok: true } }),
      utils
    );

    expect(spies.invalidateItems).toHaveBeenCalledTimes(1);
  });

  it("does not ask again once the dock job is seeded", () => {
    const utils = trpc.useUtils();
    seedPlexSyncDockJob([{ id: "pl_1", name: "Road Trip" }]);

    handlePlexSyncAllProgress(
      makeEvent({ phase: "progress", synced: 1, total: 1, current: { id: "pl_1", ok: true } }),
      utils
    );

    expect(spies.invalidateItems).not.toHaveBeenCalled();
  });

  it("does not ask for rows the user already dismissed", () => {
    const utils = trpc.useUtils();
    seedPlexSyncDockJob([{ id: "pl_1", name: "Road Trip" }]);
    dismissDockJob("plex-sync");

    handlePlexSyncAllProgress(
      makeEvent({ phase: "progress", synced: 1, total: 1, current: { id: "pl_1", ok: true } }),
      utils
    );

    expect(spies.invalidateItems).not.toHaveBeenCalled();
  });

  it("does not resurrect a job as complete for a tab that only saw the completion event", () => {
    const utils = trpc.useUtils();
    handlePlexSyncAllProgress(makeEvent({ phase: "complete", synced: 3, total: 3, failed: 0 }), utils);

    expect(plexJob()).toBeUndefined();
  });
});
