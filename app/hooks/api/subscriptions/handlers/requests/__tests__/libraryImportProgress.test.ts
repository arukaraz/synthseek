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

describe("handleLibraryImportProgress", () => {
  it("marks the seeded item by key on a progress event", () => {
    seedLib();
    const utils = trpc.useUtils();
    handleLibraryImportProgress(makeEvent({ phase: "progress", item: { key: "a", state: "done" } }), utils);
    expect(libJob()?.items.find((item) => item.key === "a")?.state).toBe("done");
  });

  it("ignores a progress event for a job that was never seeded", () => {
    const utils = trpc.useUtils();
    handleLibraryImportProgress(makeEvent({ phase: "progress", item: { key: "a", state: "done" } }), utils);
    expect(libJob()).toBeUndefined();
  });

  it("sets a complete status and invalidates caches when nothing failed", () => {
    seedLib();
    const utils = trpc.useUtils();
    handleLibraryImportProgress(makeEvent({ phase: "complete", imported: 2, failed: 0, total: 2 }), utils);
    expect(libJob()?.status).toBe("complete");
    expect(spies.invalidateSummary).toHaveBeenCalledTimes(1);
    expect(spies.invalidateAll).toHaveBeenCalledTimes(1);
  });

  it("sets a partial status when some imported and some failed", () => {
    seedLib();
    const utils = trpc.useUtils();
    handleLibraryImportProgress(makeEvent({ phase: "complete", imported: 1, failed: 1, total: 2 }), utils);
    expect(libJob()?.status).toBe("partial");
  });

  it("sets a failed status when none imported", () => {
    seedLib();
    const utils = trpc.useUtils();
    handleLibraryImportProgress(makeEvent({ phase: "complete", imported: 0, failed: 2, total: 2 }), utils);
    expect(libJob()?.status).toBe("failed");
  });
});
