import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { SubscriptionEventType, type LibraryImportProgressPayload } from "@api/__generated__/types";
import { trpc } from "@utils/trpc";
import { handleLibraryImportProgress } from "../libraryImportProgress";
import { buildDockItems, resetDockStore, seedDockJob, useDockJobs } from "../../../shared/progressDock";
import type { DockJob } from "../../../shared/progressDock";

const spies = vi.hoisted(() => ({
  invalidateSummary: vi.fn(),
  invalidateAll: vi.fn(),
}));

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({
      requests: {
        getLibrarySummary: { invalidate: spies.invalidateSummary },
        getAll: { invalidate: spies.invalidateAll },
      },
    }),
  },
}));

function makeEvent(overrides: Partial<LibraryImportProgressPayload>): LibraryImportProgressPayload {
  return {
    eventType: SubscriptionEventType.LibraryImportProgress,
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
  spies.invalidateSummary.mockReset();
  spies.invalidateAll.mockReset();
  resetDockStore();
});

function markItem(state: LibraryImportProgressPayload["item"], utils: ReturnType<typeof trpc.useUtils>): void {
  handleLibraryImportProgress(makeEvent({ phase: "progress", item: state }), utils);
}

describe("handleLibraryImportProgress", () => {
  it("marks the seeded item by key on a progress event", () => {
    seedLib();
    const utils = trpc.useUtils();
    markItem({ key: "a", state: "done" }, utils);
    expect(libJob()?.items.find((item) => item.key === "a")?.state).toBe("done");
  });

  it("ignores a progress event for a job that was never seeded", () => {
    const utils = trpc.useUtils();
    markItem({ key: "a", state: "done" }, utils);
    expect(libJob()).toBeUndefined();
  });

  it("carries the failure reason into the store on a failed item", () => {
    seedLib();
    const utils = trpc.useUtils();
    markItem({ key: "a", state: "failed", reason: "notInLibrary" }, utils);
    expect(libJob()?.items.find((item) => item.key === "a")?.reason).toBe("notInLibrary");
  });

  it("invalidates getAll when an item reaches done so it lands in the list", () => {
    seedLib();
    const utils = trpc.useUtils();
    markItem({ key: "a", state: "done" }, utils);
    expect(spies.invalidateAll).toHaveBeenCalledTimes(1);
  });

  it("does not invalidate getAll for a non-done item state", () => {
    seedLib();
    const utils = trpc.useUtils();
    markItem({ key: "a", state: "failed", reason: "importError" }, utils);
    markItem({ key: "b", state: "skipped" }, utils);
    expect(spies.invalidateAll).not.toHaveBeenCalled();
  });

  it("finalizes a complete status from the items and invalidates caches when nothing failed", () => {
    seedLib();
    const utils = trpc.useUtils();
    markItem({ key: "a", state: "done" }, utils);
    markItem({ key: "b", state: "done" }, utils);
    spies.invalidateAll.mockReset();
    handleLibraryImportProgress(makeEvent({ phase: "complete", imported: 2, failed: 0, total: 2 }), utils);
    expect(libJob()?.status).toBe("complete");
    expect(spies.invalidateSummary).toHaveBeenCalledTimes(1);
    expect(spies.invalidateAll).toHaveBeenCalledTimes(1);
  });

  it("finalizes complete for an all-skipped job (everything already present)", () => {
    seedLib();
    const utils = trpc.useUtils();
    markItem({ key: "a", state: "skipped" }, utils);
    markItem({ key: "b", state: "skipped" }, utils);
    handleLibraryImportProgress(makeEvent({ phase: "complete", imported: 0, failed: 0, total: 2 }), utils);
    expect(libJob()?.status).toBe("complete");
  });

  it("finalizes partial from the items when one item failed, ignoring the event counts", () => {
    seedLib();
    const utils = trpc.useUtils();
    markItem({ key: "a", state: "done" }, utils);
    markItem({ key: "b", state: "failed", reason: "noMatchableTracks" }, utils);
    handleLibraryImportProgress(makeEvent({ phase: "complete", imported: 2, failed: 0, total: 2 }), utils);
    expect(libJob()?.status).toBe("partial");
  });

  it("finalizes failed from the items when every item failed", () => {
    seedLib();
    const utils = trpc.useUtils();
    markItem({ key: "a", state: "failed", reason: "importError" }, utils);
    markItem({ key: "b", state: "failed", reason: "sourceHasNoTracks" }, utils);
    handleLibraryImportProgress(makeEvent({ phase: "complete", imported: 0, failed: 2, total: 2 }), utils);
    expect(libJob()?.status).toBe("failed");
  });
});
