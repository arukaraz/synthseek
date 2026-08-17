import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { SubscriptionEventType, type LibraryImportProgressPayload } from "@api/__generated__/types";
import { trpc } from "@utils/trpc";
import { handleLibraryImportProgress } from "../libraryImportProgress";
import { buildDockItems, resetDockStore, seedDockJob, useDockJobs } from "../../../shared/progressDock";
import type { DockJob } from "../../../shared/progressDock";
import { resetRequestListInvalidation } from "../../../shared/requestListInvalidation";

const spies = vi.hoisted(() => ({
  invalidateSummary: vi.fn(),
  invalidateAll: vi.fn(),
  invalidateAlbums: vi.fn(),
  invalidateArtists: vi.fn(),
  invalidatePlaylists: vi.fn(),
  invalidateTracks: vi.fn(),
  invalidateCounts: vi.fn(),
}));

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({
      requests: {
        getLibrarySummary: { invalidate: spies.invalidateSummary },
        getAll: { invalidate: spies.invalidateAll },
        getRecentTracks: { invalidate: vi.fn() },
        getDetail: { invalidate: vi.fn() },
      },
      library: {
        getAlbums: { invalidate: spies.invalidateAlbums },
        getArtists: { invalidate: spies.invalidateArtists },
        getPlaylists: { invalidate: spies.invalidatePlaylists },
        getTracks: { invalidate: spies.invalidateTracks },
        getCounts: { invalidate: spies.invalidateCounts },
      },
    }),
  },
}));

const VIEWER_ID = "u_self";
const OTHER_USER_ID = "u_other";

function makeEvent(overrides: Partial<LibraryImportProgressPayload>): LibraryImportProgressPayload {
  return {
    eventType: SubscriptionEventType.LibraryImportProgress,
    userId: VIEWER_ID,
    jobId: "lib-1",
    provider: "spotify",
    phase: "progress",
    imported: 0,
    failed: 0,
    total: 2,
    ...overrides,
  };
}

function readJobs(): DockJob[] {
  const { result } = renderHook(() => useDockJobs());
  return result.current;
}

function libJob(): DockJob | undefined {
  return readJobs().find((job) => job.id === "lib-1");
}

function seedLib(): void {
  seedDockJob({
    id: "lib-1",
    kind: "library-import",
    provider: "spotify",
    items: buildDockItems([
      { key: "a", name: "Alpha" },
      { key: "b", name: "Beta" },
    ]),
    status: "running",
  });
}

beforeEach(() => {
  resetRequestListInvalidation();
  spies.invalidateSummary.mockReset();
  spies.invalidateAll.mockReset();
  spies.invalidateAlbums.mockReset();
  spies.invalidateArtists.mockReset();
  spies.invalidatePlaylists.mockReset();
  spies.invalidateTracks.mockReset();
  spies.invalidateCounts.mockReset();
  resetDockStore();
});

function expectLibraryViewsInvalidated(times: number): void {
  expect(spies.invalidateAlbums).toHaveBeenCalledTimes(times);
  expect(spies.invalidateArtists).toHaveBeenCalledTimes(times);
  expect(spies.invalidatePlaylists).toHaveBeenCalledTimes(times);
  expect(spies.invalidateTracks).toHaveBeenCalledTimes(times);
  expect(spies.invalidateCounts).toHaveBeenCalledTimes(times);
}

function markItem(
  state: LibraryImportProgressPayload["item"],
  utils: ReturnType<typeof trpc.useUtils>,
  viewerId: string | null
): void {
  handleLibraryImportProgress(makeEvent({ phase: "progress", item: state }), utils, viewerId);
}

describe("handleLibraryImportProgress", () => {
  it("marks the seeded item by key on a progress event", () => {
    seedLib();
    const utils = trpc.useUtils();
    markItem({ key: "a", state: "done" }, utils, VIEWER_ID);
    expect(libJob()?.items.find((item) => item.key === "a")?.state).toBe("done");
  });

  it("ignores a progress event for a job that was never seeded", () => {
    const utils = trpc.useUtils();
    markItem({ key: "a", state: "done" }, utils, VIEWER_ID);
    expect(libJob()).toBeUndefined();
  });

  it("carries the failure reason into the store on a failed item", () => {
    seedLib();
    const utils = trpc.useUtils();
    markItem({ key: "a", state: "failed", reason: "notInLibrary" }, utils, VIEWER_ID);
    expect(libJob()?.items.find((item) => item.key === "a")?.reason).toBe("notInLibrary");
  });

  it("invalidates getAll and the library views when an item reaches done so it lands in the list", () => {
    seedLib();
    const utils = trpc.useUtils();
    markItem({ key: "a", state: "done" }, utils, VIEWER_ID);
    expect(spies.invalidateAll).toHaveBeenCalledTimes(1);
    expectLibraryViewsInvalidated(1);
  });

  it("does not invalidate getAll or the library views for a non-done item state", () => {
    seedLib();
    const utils = trpc.useUtils();
    markItem({ key: "a", state: "failed", reason: "importError" }, utils, VIEWER_ID);
    markItem({ key: "b", state: "skipped" }, utils, VIEWER_ID);
    expect(spies.invalidateAll).not.toHaveBeenCalled();
    expectLibraryViewsInvalidated(0);
  });

  it("finalizes a complete status from the items and invalidates caches when nothing failed", () => {
    seedLib();
    const utils = trpc.useUtils();
    markItem({ key: "a", state: "done" }, utils, VIEWER_ID);
    markItem({ key: "b", state: "done" }, utils, VIEWER_ID);
    spies.invalidateAll.mockReset();
    spies.invalidateAlbums.mockReset();
    spies.invalidateArtists.mockReset();
    spies.invalidatePlaylists.mockReset();
    spies.invalidateTracks.mockReset();
    spies.invalidateCounts.mockReset();
    handleLibraryImportProgress(makeEvent({ phase: "complete", imported: 2, failed: 0, total: 2 }), utils, VIEWER_ID);
    expect(libJob()?.status).toBe("complete");
    expect(spies.invalidateSummary).toHaveBeenCalledTimes(1);
    expect(spies.invalidateAll).toHaveBeenCalledTimes(1);
    expectLibraryViewsInvalidated(1);
  });

  it("finalizes complete for an all-skipped job (everything already present)", () => {
    seedLib();
    const utils = trpc.useUtils();
    markItem({ key: "a", state: "skipped" }, utils, VIEWER_ID);
    markItem({ key: "b", state: "skipped" }, utils, VIEWER_ID);
    handleLibraryImportProgress(makeEvent({ phase: "complete", imported: 0, failed: 0, total: 2 }), utils, VIEWER_ID);
    expect(libJob()?.status).toBe("complete");
  });

  it("finalizes partial from the items when one item failed, ignoring the event counts", () => {
    seedLib();
    const utils = trpc.useUtils();
    markItem({ key: "a", state: "done" }, utils, VIEWER_ID);
    markItem({ key: "b", state: "failed", reason: "noMatchableTracks" }, utils, VIEWER_ID);
    handleLibraryImportProgress(makeEvent({ phase: "complete", imported: 2, failed: 0, total: 2 }), utils, VIEWER_ID);
    expect(libJob()?.status).toBe("partial");
  });

  it("finalizes failed from the items when every item failed", () => {
    seedLib();
    const utils = trpc.useUtils();
    markItem({ key: "a", state: "failed", reason: "importError" }, utils, VIEWER_ID);
    markItem({ key: "b", state: "failed", reason: "sourceHasNoTracks" }, utils, VIEWER_ID);
    handleLibraryImportProgress(makeEvent({ phase: "complete", imported: 0, failed: 2, total: 2 }), utils, VIEWER_ID);
    expect(libJob()?.status).toBe("failed");
  });

  it("leaves the dock untouched for another user's import", () => {
    seedLib();
    const utils = trpc.useUtils();

    handleLibraryImportProgress(
      makeEvent({ userId: OTHER_USER_ID, phase: "progress", item: { key: "a", state: "done" } }),
      utils,
      VIEWER_ID
    );
    handleLibraryImportProgress(
      makeEvent({ userId: OTHER_USER_ID, phase: "complete", imported: 2, failed: 0, total: 2 }),
      utils,
      VIEWER_ID
    );

    expect(libJob()?.items.find((item) => item.key === "a")?.state).toBe("pending");
    expect(libJob()?.status).toBe("running");
  });

  it("still refreshes the shared lists for another user's import", () => {
    const utils = trpc.useUtils();

    handleLibraryImportProgress(
      makeEvent({ userId: OTHER_USER_ID, phase: "complete", imported: 2, failed: 0, total: 2 }),
      utils,
      VIEWER_ID
    );

    expect(spies.invalidateSummary).toHaveBeenCalledTimes(1);
    expect(spies.invalidateAll).toHaveBeenCalledTimes(1);
    expectLibraryViewsInvalidated(1);
  });

  it("marks the dock while the viewer is unknown", () => {
    seedLib();
    const utils = trpc.useUtils();

    markItem({ key: "a", state: "done" }, utils, null);

    expect(libJob()?.items.find((item) => item.key === "a")?.state).toBe("done");
  });
});
