import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { SubscriptionEventType, type PlaylistSyncAllProgressPayload } from "@api/__generated__/types";
import { trpc } from "@utils/trpc";
import { handlePlaylistSyncAllProgress } from "../playlistSyncAllProgress";
import { subscribePlaylistSyncAll, type PlaylistSyncAllUpdate } from "../../../shared/playlistSyncAll";
import { dismissDockJob, resetDockStore, seedPlaylistSyncDockJob, useDockJobs } from "../../../shared/progressDock";
import type { DockJob } from "../../../shared/progressDock";
import { resetRequestListInvalidation } from "../../../shared/requestListInvalidation";

const spies = vi.hoisted(() => ({
  setData: vi.fn(),
  invalidate: vi.fn(),
  invalidateItems: vi.fn(),
}));

vi.mock("@utils/trpc", () => ({
  trpc: {
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

const VIEWER_ID = "u_self";
const OTHER_USER_ID = "u_other";

function makeEvent(overrides: Partial<PlaylistSyncAllProgressPayload>): PlaylistSyncAllProgressPayload {
  return {
    eventType: SubscriptionEventType.PlaylistSyncAllProgress,
    userId: VIEWER_ID,
    server: "plex",
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

function syncJob(): DockJob | undefined {
  return readJobs().find((job) => job.id === "playlist-sync");
}

beforeEach(() => {
  resetRequestListInvalidation();
  spies.setData.mockReset();
  spies.invalidate.mockReset();
  spies.invalidateItems.mockReset();
  resetDockStore();
});

describe("handlePlaylistSyncAllProgress", () => {
  it("emits the update to subscribers of the shared bus", () => {
    const received: PlaylistSyncAllUpdate[] = [];
    const unsubscribe = subscribePlaylistSyncAll((u) => received.push(u));
    const utils = trpc.useUtils();

    handlePlaylistSyncAllProgress(makeEvent({ phase: "progress", synced: 3, total: 8 }), utils, VIEWER_ID);

    expect(received).toEqual([{ server: "plex", phase: "progress", synced: 3, total: 8, failed: undefined }]);
    unsubscribe();
  });

  it("seeds the query state as running while in progress", () => {
    const utils = trpc.useUtils();

    handlePlaylistSyncAllProgress(makeEvent({ phase: "progress", synced: 4, total: 10 }), utils, VIEWER_ID);

    expect(spies.setData).toHaveBeenCalledWith(undefined, { running: true, server: "plex", synced: 4, total: 10 });
    expect(spies.invalidate).not.toHaveBeenCalled();
  });

  it("marks not running and invalidates the list on completion", () => {
    const utils = trpc.useUtils();

    handlePlaylistSyncAllProgress(makeEvent({ phase: "complete", synced: 8, total: 8, failed: 1 }), utils, VIEWER_ID);

    expect(spies.setData).toHaveBeenCalledWith(undefined, { running: false, server: "plex", synced: 8, total: 8 });
    expect(spies.invalidate).toHaveBeenCalledTimes(1);
  });

  it("seeds the dock from the named items on start", () => {
    const utils = trpc.useUtils();
    handlePlaylistSyncAllProgress(
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

    const job = syncJob();
    expect(job?.kind).toBe("playlist-sync");
    expect(job?.items.map((item) => item.name)).toEqual(["Road Trip", "Focus"]);
  });

  it("names the server the run syncs to on the card it seeds", () => {
    const utils = trpc.useUtils();
    handlePlaylistSyncAllProgress(
      makeEvent({ server: "jellyfin", phase: "start", synced: 0, total: 1, items: [{ id: "p1", name: "Road Trip" }] }),
      utils,
      VIEWER_ID
    );

    expect(syncJob()?.provider).toBe("jellyfin");
  });

  it("marks an item done or failed per progress tick", () => {
    const utils = trpc.useUtils();
    handlePlaylistSyncAllProgress(
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
    handlePlaylistSyncAllProgress(
      makeEvent({ phase: "progress", synced: 1, total: 2, current: { id: "p1", ok: true } }),
      utils,
      VIEWER_ID
    );
    handlePlaylistSyncAllProgress(
      makeEvent({ phase: "progress", synced: 1, total: 2, current: { id: "p2", ok: false } }),
      utils,
      VIEWER_ID
    );

    const job = syncJob();
    expect(job?.items.find((item) => item.key === "p1")?.state).toBe("done");
    expect(job?.items.find((item) => item.key === "p2")?.state).toBe("failed");
  });

  it("sets a partial status when some synced and some failed", () => {
    const utils = trpc.useUtils();
    handlePlaylistSyncAllProgress(
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
    handlePlaylistSyncAllProgress(makeEvent({ phase: "complete", synced: 1, total: 2, failed: 1 }), utils, VIEWER_ID);

    expect(syncJob()?.status).toBe("partial");
  });

  it("advances the rehydrated row a progress event names after a late join", () => {
    const utils = trpc.useUtils();
    seedPlaylistSyncDockJob("plex", [
      { id: "pl_1", name: "Road Trip", state: "done" },
      { id: "pl_2", name: "Focus", state: "pending" },
      { id: "pl_3", name: "Chill", state: "pending" },
    ]);

    handlePlaylistSyncAllProgress(
      makeEvent({ phase: "progress", synced: 2, total: 3, current: { id: "pl_2", ok: true } }),
      utils,
      VIEWER_ID
    );

    const job = syncJob();
    expect(job?.items.find((item) => item.key === "pl_1")?.state).toBe("done");
    expect(job?.items.find((item) => item.key === "pl_2")?.state).toBe("done");
    expect(job?.items.find((item) => item.key === "pl_3")?.state).toBe("pending");
  });

  it("does not fabricate placeholder rows for a late-joining tab with no rehydrated job", () => {
    const utils = trpc.useUtils();
    handlePlaylistSyncAllProgress(
      makeEvent({ phase: "progress", synced: 1, total: 3, current: { id: "pl_1", ok: true } }),
      utils,
      VIEWER_ID
    );

    expect(syncJob()).toBeUndefined();
  });

  it("asks the server for the in-flight rows when a progress event finds no dock job", () => {
    const utils = trpc.useUtils();
    handlePlaylistSyncAllProgress(
      makeEvent({ phase: "progress", synced: 1, total: 3, current: { id: "pl_1", ok: true } }),
      utils,
      VIEWER_ID
    );

    expect(spies.invalidateItems).toHaveBeenCalledTimes(1);
  });

  it("does not ask again once the dock job is seeded", () => {
    const utils = trpc.useUtils();
    seedPlaylistSyncDockJob("plex", [{ id: "pl_1", name: "Road Trip" }]);

    handlePlaylistSyncAllProgress(
      makeEvent({ phase: "progress", synced: 1, total: 1, current: { id: "pl_1", ok: true } }),
      utils,
      VIEWER_ID
    );

    expect(spies.invalidateItems).not.toHaveBeenCalled();
  });

  it("does not ask for rows the user already dismissed", () => {
    const utils = trpc.useUtils();
    seedPlaylistSyncDockJob("plex", [{ id: "pl_1", name: "Road Trip" }]);
    dismissDockJob("playlist-sync");

    handlePlaylistSyncAllProgress(
      makeEvent({ phase: "progress", synced: 1, total: 1, current: { id: "pl_1", ok: true } }),
      utils,
      VIEWER_ID
    );

    expect(spies.invalidateItems).not.toHaveBeenCalled();
  });

  it("does not resurrect a job as complete for a tab that only saw the completion event", () => {
    const utils = trpc.useUtils();
    handlePlaylistSyncAllProgress(makeEvent({ phase: "complete", synced: 3, total: 3, failed: 0 }), utils, VIEWER_ID);

    expect(syncJob()).toBeUndefined();
  });

  it("does not put another user's run in the dock", () => {
    const utils = trpc.useUtils();
    handlePlaylistSyncAllProgress(
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

    expect(syncJob()).toBeUndefined();
  });

  it("does not ask the server for in-flight rows on another user's progress event", () => {
    const utils = trpc.useUtils();
    handlePlaylistSyncAllProgress(
      makeEvent({ userId: OTHER_USER_ID, phase: "progress", synced: 1, total: 3, current: { id: "p1", ok: true } }),
      utils,
      VIEWER_ID
    );

    expect(spies.invalidateItems).not.toHaveBeenCalled();
    expect(syncJob()).toBeUndefined();
  });

  it("still drives a card seeded from this session's own rows when another user started the run", () => {
    const utils = trpc.useUtils();
    seedPlaylistSyncDockJob("plex", [
      { id: "pl_1", name: "Road Trip", state: "pending" },
      { id: "pl_2", name: "Focus", state: "pending" },
    ]);

    handlePlaylistSyncAllProgress(
      makeEvent({ userId: OTHER_USER_ID, phase: "progress", synced: 1, total: 2, current: { id: "pl_1", ok: true } }),
      utils,
      VIEWER_ID
    );
    handlePlaylistSyncAllProgress(
      makeEvent({ userId: OTHER_USER_ID, phase: "complete", synced: 2, total: 2, failed: 0 }),
      utils,
      VIEWER_ID
    );

    expect(syncJob()?.items.find((item) => item.key === "pl_1")?.state).toBe("done");
    expect(syncJob()?.status).toBe("complete");
  });

  it("does not rewrite a settled card with another user's outcome", () => {
    const utils = trpc.useUtils();
    seedPlaylistSyncDockJob("plex", [{ id: "pl_1", name: "Road Trip", state: "done" }]);
    handlePlaylistSyncAllProgress(makeEvent({ phase: "complete", synced: 1, total: 1, failed: 0 }), utils, VIEWER_ID);
    expect(syncJob()?.status).toBe("complete");

    handlePlaylistSyncAllProgress(
      makeEvent({ userId: OTHER_USER_ID, phase: "complete", synced: 0, total: 4, failed: 4 }),
      utils,
      VIEWER_ID
    );

    expect(syncJob()?.status).toBe("complete");
  });

  it("does not mark a row on a settled card from another user's run", () => {
    const utils = trpc.useUtils();
    seedPlaylistSyncDockJob("plex", [
      { id: "pl_1", name: "Road Trip", state: "done" },
      { id: "pl_2", name: "Focus", state: "pending" },
    ]);
    handlePlaylistSyncAllProgress(makeEvent({ phase: "complete", synced: 1, total: 2, failed: 0 }), utils, VIEWER_ID);

    handlePlaylistSyncAllProgress(
      makeEvent({ userId: OTHER_USER_ID, phase: "progress", synced: 1, total: 4, current: { id: "pl_2", ok: false } }),
      utils,
      VIEWER_ID
    );

    expect(syncJob()?.items.find((item) => item.key === "pl_2")?.state).toBe("pending");
  });

  it("does not rewrite a settled card from a late event of the viewer's own earlier run", () => {
    const utils = trpc.useUtils();
    seedPlaylistSyncDockJob("plex", [{ id: "pl_1", name: "Road Trip", state: "done" }]);
    handlePlaylistSyncAllProgress(makeEvent({ phase: "complete", synced: 1, total: 1, failed: 0 }), utils, VIEWER_ID);

    handlePlaylistSyncAllProgress(makeEvent({ phase: "complete", synced: 0, total: 1, failed: 1 }), utils, VIEWER_ID);

    expect(syncJob()?.status).toBe("complete");
  });

  it("still marks a row and settles while the card is running", () => {
    const utils = trpc.useUtils();
    seedPlaylistSyncDockJob("plex", [
      { id: "pl_1", name: "Road Trip", state: "pending" },
      { id: "pl_2", name: "Focus", state: "pending" },
    ]);

    handlePlaylistSyncAllProgress(
      makeEvent({ phase: "progress", synced: 1, total: 2, current: { id: "pl_2", ok: false } }),
      utils,
      VIEWER_ID
    );
    handlePlaylistSyncAllProgress(makeEvent({ phase: "complete", synced: 1, total: 2, failed: 1 }), utils, VIEWER_ID);

    expect(syncJob()?.items.find((item) => item.key === "pl_2")?.state).toBe("failed");
    expect(syncJob()?.status).toBe("partial");
  });

  it("keeps the instance-wide run state live for another user's run", () => {
    const utils = trpc.useUtils();
    handlePlaylistSyncAllProgress(
      makeEvent({ userId: OTHER_USER_ID, phase: "complete", synced: 5, total: 5, failed: 0 }),
      utils,
      VIEWER_ID
    );

    expect(spies.setData).toHaveBeenCalledWith(undefined, { running: false, server: "plex", synced: 5, total: 5 });
    expect(spies.invalidate).toHaveBeenCalledTimes(1);
  });

  it("drives the dock for every event while the viewer is unknown", () => {
    const utils = trpc.useUtils();
    handlePlaylistSyncAllProgress(
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

    expect(syncJob()?.items.map((item) => item.name)).toEqual(["Road Trip"]);
  });
});
