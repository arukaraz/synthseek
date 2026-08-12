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

const VIEWER_ID = "u_self";
const OTHER_USER_ID = "u_other";

function makeEvent(overrides: Partial<PlexSyncAllProgressPayload>): PlexSyncAllProgressPayload {
  return {
    eventType: SubscriptionEventType.PlexSyncAllProgress,
    userId: VIEWER_ID,
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

    handlePlexSyncAllProgress(makeEvent({ phase: "progress", synced: 3, total: 8 }), utils, VIEWER_ID);

    expect(received).toEqual([{ phase: "progress", synced: 3, total: 8, failed: undefined }]);
    unsubscribe();
  });

  it("seeds the query state as running while in progress", () => {
    const utils = trpc.useUtils();

    handlePlexSyncAllProgress(makeEvent({ phase: "progress", synced: 4, total: 10 }), utils, VIEWER_ID);

    expect(spies.setData).toHaveBeenCalledWith(undefined, { running: true, synced: 4, total: 10 });
    expect(spies.invalidate).not.toHaveBeenCalled();
  });

  it("marks not running and invalidates the list on completion", () => {
    const utils = trpc.useUtils();

    handlePlexSyncAllProgress(makeEvent({ phase: "complete", synced: 8, total: 8, failed: 1 }), utils, VIEWER_ID);

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
      utils,
      VIEWER_ID
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
      utils,
      VIEWER_ID
    );
    handlePlexSyncAllProgress(
      makeEvent({ phase: "progress", synced: 1, total: 2, current: { id: "p1", ok: true } }),
      utils,
      VIEWER_ID
    );
    handlePlexSyncAllProgress(
      makeEvent({ phase: "progress", synced: 1, total: 2, current: { id: "p2", ok: false } }),
      utils,
      VIEWER_ID
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
      utils,
      VIEWER_ID
    );
    handlePlexSyncAllProgress(makeEvent({ phase: "complete", synced: 1, total: 2, failed: 1 }), utils, VIEWER_ID);

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
      utils,
      VIEWER_ID
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
      utils,
      VIEWER_ID
    );

    expect(plexJob()).toBeUndefined();
  });

  it("asks the server for the in-flight rows when a progress event finds no dock job", () => {
    const utils = trpc.useUtils();
    handlePlexSyncAllProgress(
      makeEvent({ phase: "progress", synced: 1, total: 3, current: { id: "pl_1", ok: true } }),
      utils,
      VIEWER_ID
    );

    expect(spies.invalidateItems).toHaveBeenCalledTimes(1);
  });

  it("does not ask again once the dock job is seeded", () => {
    const utils = trpc.useUtils();
    seedPlexSyncDockJob([{ id: "pl_1", name: "Road Trip" }]);

    handlePlexSyncAllProgress(
      makeEvent({ phase: "progress", synced: 1, total: 1, current: { id: "pl_1", ok: true } }),
      utils,
      VIEWER_ID
    );

    expect(spies.invalidateItems).not.toHaveBeenCalled();
  });

  it("does not ask for rows the user already dismissed", () => {
    const utils = trpc.useUtils();
    seedPlexSyncDockJob([{ id: "pl_1", name: "Road Trip" }]);
    dismissDockJob("plex-sync");

    handlePlexSyncAllProgress(
      makeEvent({ phase: "progress", synced: 1, total: 1, current: { id: "pl_1", ok: true } }),
      utils,
      VIEWER_ID
    );

    expect(spies.invalidateItems).not.toHaveBeenCalled();
  });

  it("does not resurrect a job as complete for a tab that only saw the completion event", () => {
    const utils = trpc.useUtils();
    handlePlexSyncAllProgress(makeEvent({ phase: "complete", synced: 3, total: 3, failed: 0 }), utils, VIEWER_ID);

    expect(plexJob()).toBeUndefined();
  });

  it("does not put another user's run in the dock", () => {
    const utils = trpc.useUtils();
    handlePlexSyncAllProgress(
      makeEvent({
        userId: OTHER_USER_ID,
        phase: "start",
        synced: 0,
        total: 2,
        items: [
          { id: "p1", name: "Their Road Trip" },
          { id: "p2", name: "Their Focus" },
        ],
      }),
      utils,
      VIEWER_ID
    );

    expect(plexJob()).toBeUndefined();
  });

  it("does not ask the server for in-flight rows on another user's progress event", () => {
    const utils = trpc.useUtils();
    handlePlexSyncAllProgress(
      makeEvent({ userId: OTHER_USER_ID, phase: "progress", synced: 1, total: 3, current: { id: "p1", ok: true } }),
      utils,
      VIEWER_ID
    );

    expect(spies.invalidateItems).not.toHaveBeenCalled();
    expect(plexJob()).toBeUndefined();
  });

  it("still drives a card seeded from this session's own rows when another user started the run", () => {
    const utils = trpc.useUtils();
    seedPlexSyncDockJob([
      { id: "pl_1", name: "Road Trip", state: "pending" },
      { id: "pl_2", name: "Focus", state: "pending" },
    ]);

    handlePlexSyncAllProgress(
      makeEvent({ userId: OTHER_USER_ID, phase: "progress", synced: 1, total: 2, current: { id: "pl_1", ok: true } }),
      utils,
      VIEWER_ID
    );
    handlePlexSyncAllProgress(
      makeEvent({ userId: OTHER_USER_ID, phase: "complete", synced: 2, total: 2, failed: 0 }),
      utils,
      VIEWER_ID
    );

    expect(plexJob()?.items.find((item) => item.key === "pl_1")?.state).toBe("done");
    expect(plexJob()?.status).toBe("complete");
  });

  it("does not rewrite a settled card with another user's outcome", () => {
    const utils = trpc.useUtils();
    seedPlexSyncDockJob([{ id: "pl_1", name: "Road Trip", state: "done" }]);
    handlePlexSyncAllProgress(makeEvent({ phase: "complete", synced: 1, total: 1, failed: 0 }), utils, VIEWER_ID);
    expect(plexJob()?.status).toBe("complete");

    handlePlexSyncAllProgress(
      makeEvent({ userId: OTHER_USER_ID, phase: "complete", synced: 0, total: 4, failed: 4 }),
      utils,
      VIEWER_ID
    );

    expect(plexJob()?.status).toBe("complete");
  });

  it("does not mark a row on a settled card from another user's run", () => {
    const utils = trpc.useUtils();
    seedPlexSyncDockJob([
      { id: "pl_1", name: "Road Trip", state: "done" },
      { id: "pl_2", name: "Focus", state: "pending" },
    ]);
    handlePlexSyncAllProgress(makeEvent({ phase: "complete", synced: 1, total: 2, failed: 0 }), utils, VIEWER_ID);

    handlePlexSyncAllProgress(
      makeEvent({ userId: OTHER_USER_ID, phase: "progress", synced: 1, total: 4, current: { id: "pl_2", ok: false } }),
      utils,
      VIEWER_ID
    );

    expect(plexJob()?.items.find((item) => item.key === "pl_2")?.state).toBe("pending");
  });

  it("does not rewrite a settled card from a late event of the viewer's own earlier run", () => {
    const utils = trpc.useUtils();
    seedPlexSyncDockJob([{ id: "pl_1", name: "Road Trip", state: "done" }]);
    handlePlexSyncAllProgress(makeEvent({ phase: "complete", synced: 1, total: 1, failed: 0 }), utils, VIEWER_ID);

    handlePlexSyncAllProgress(makeEvent({ phase: "complete", synced: 0, total: 1, failed: 1 }), utils, VIEWER_ID);

    expect(plexJob()?.status).toBe("complete");
  });

  it("still marks a row and settles while the card is running", () => {
    const utils = trpc.useUtils();
    seedPlexSyncDockJob([
      { id: "pl_1", name: "Road Trip", state: "pending" },
      { id: "pl_2", name: "Focus", state: "pending" },
    ]);

    handlePlexSyncAllProgress(
      makeEvent({ phase: "progress", synced: 1, total: 2, current: { id: "pl_2", ok: false } }),
      utils,
      VIEWER_ID
    );
    handlePlexSyncAllProgress(makeEvent({ phase: "complete", synced: 1, total: 2, failed: 1 }), utils, VIEWER_ID);

    expect(plexJob()?.items.find((item) => item.key === "pl_2")?.state).toBe("failed");
    expect(plexJob()?.status).toBe("partial");
  });

  it("keeps the instance-wide run state live for another user's run", () => {
    const utils = trpc.useUtils();
    handlePlexSyncAllProgress(
      makeEvent({ userId: OTHER_USER_ID, phase: "complete", synced: 5, total: 5, failed: 0 }),
      utils,
      VIEWER_ID
    );

    expect(spies.setData).toHaveBeenCalledWith(undefined, { running: false, synced: 5, total: 5 });
    expect(spies.invalidate).toHaveBeenCalledTimes(1);
  });

  it("drives the dock for every event while the viewer is unknown", () => {
    const utils = trpc.useUtils();
    handlePlexSyncAllProgress(
      makeEvent({
        userId: OTHER_USER_ID,
        phase: "start",
        synced: 0,
        total: 1,
        items: [{ id: "p1", name: "Road Trip" }],
      }),
      utils,
      null
    );

    expect(plexJob()?.items.map((item) => item.name)).toEqual(["Road Trip"]);
  });
});
