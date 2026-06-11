import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DOCK_AUTO_DISMISS_MS } from "../constants";
import {
  buildDockItems,
  dismissDockJob,
  finalizeDockJob,
  hasDockJob,
  isDockJobDismissed,
  markDockItem,
  resetDockStore,
  seedDockJob,
  setDockJobStatus,
  useDockJobs,
} from "../store";
import type { DockJob } from "../types";

function readJobs(): DockJob[] {
  const { result } = renderHook(() => useDockJobs());
  return result.current;
}

function seedLibrary(id: string, names: string[]): void {
  seedDockJob({
    id,
    kind: "library-import",
    items: buildDockItems(names.map((name, index) => ({ key: String(index), name }))),
    status: "running",
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  resetDockStore();
});

afterEach(() => {
  resetDockStore();
  vi.useRealTimers();
});

describe("progressDock store", () => {
  it("seeds a job with pending items and exposes it via the hook", () => {
    seedLibrary("job-a", ["Alpha", "Beta"]);
    const jobs = readJobs();
    expect(jobs).toHaveLength(1);
    expect(jobs[0].id).toBe("job-a");
    expect(jobs[0].items.map((item) => item.state)).toEqual(["pending", "pending"]);
  });

  it("marks an item by key and leaves the rest untouched", () => {
    seedLibrary("job-b", ["Alpha", "Beta"]);
    markDockItem("job-b", "1", "done");
    const jobs = readJobs();
    expect(jobs[0].items.find((item) => item.key === "1")?.state).toBe("done");
    expect(jobs[0].items.find((item) => item.key === "0")?.state).toBe("pending");
  });

  it("sets the failure reason on a failed item", () => {
    seedLibrary("job-reason", ["Alpha"]);
    markDockItem("job-reason", "0", "failed", "noMatchableTracks");
    const item = readJobs()[0].items.find((entry) => entry.key === "0");
    expect(item?.state).toBe("failed");
    expect(item?.reason).toBe("noMatchableTracks");
  });

  it("clears a stale reason when an item transitions away from failed", () => {
    seedLibrary("job-reason-2", ["Alpha"]);
    markDockItem("job-reason-2", "0", "failed", "importError");
    markDockItem("job-reason-2", "0", "done");
    const item = readJobs()[0].items.find((entry) => entry.key === "0");
    expect(item?.state).toBe("done");
    expect(item?.reason).toBeUndefined();
  });

  it("ignores a mark for an unknown job (late event without a seed)", () => {
    markDockItem("ghost", "0", "done");
    expect(readJobs()).toHaveLength(0);
  });

  it("dismisses a job and tracks the dismissal", () => {
    seedLibrary("job-c", ["Alpha"]);
    dismissDockJob("job-c");
    expect(readJobs()).toHaveLength(0);
    expect(isDockJobDismissed("job-c")).toBe(true);
  });

  it("does not resurrect a dismissed job from a late mark", () => {
    seedLibrary("job-d", ["Alpha"]);
    dismissDockJob("job-d");
    markDockItem("job-d", "0", "done");
    setDockJobStatus("job-d", "complete");
    expect(readJobs()).toHaveLength(0);
    expect(hasDockJob("job-d")).toBe(false);
  });

  it("re-seeding a previously dismissed id clears the dismissal", () => {
    seedLibrary("job-e", ["Alpha"]);
    dismissDockJob("job-e");
    seedLibrary("job-e", ["Beta"]);
    expect(isDockJobDismissed("job-e")).toBe(false);
    expect(readJobs()).toHaveLength(1);
  });

  it("auto-dismisses a job after the constant once it reaches a terminal status", () => {
    seedLibrary("job-f", ["Alpha"]);
    setDockJobStatus("job-f", "complete");
    expect(readJobs()).toHaveLength(1);
    vi.advanceTimersByTime(DOCK_AUTO_DISMISS_MS + 1);
    expect(readJobs()).toHaveLength(0);
  });

  it("clears a pending auto-dismiss when a new job re-seeds the same id", () => {
    seedLibrary("job-g", ["Alpha"]);
    setDockJobStatus("job-g", "complete");
    seedLibrary("job-g", ["Beta"]);
    vi.advanceTimersByTime(DOCK_AUTO_DISMISS_MS + 1);
    expect(readJobs()).toHaveLength(1);
    expect(readJobs()[0].status).toBe("running");
  });

  describe("finalizeDockJob", () => {
    it("finalizes complete when every item resolved without a failure", () => {
      seedLibrary("job-fin-a", ["Alpha", "Beta"]);
      markDockItem("job-fin-a", "0", "done");
      markDockItem("job-fin-a", "1", "skipped");
      finalizeDockJob("job-fin-a");
      expect(readJobs()[0].status).toBe("complete");
    });

    it("finalizes partial when some items failed and some resolved", () => {
      seedLibrary("job-fin-b", ["Alpha", "Beta"]);
      markDockItem("job-fin-b", "0", "done");
      markDockItem("job-fin-b", "1", "failed", "importError");
      finalizeDockJob("job-fin-b");
      expect(readJobs()[0].status).toBe("partial");
    });

    it("finalizes failed when every item failed", () => {
      seedLibrary("job-fin-c", ["Alpha", "Beta"]);
      markDockItem("job-fin-c", "0", "failed", "notInLibrary");
      markDockItem("job-fin-c", "1", "failed", "sourceHasNoTracks");
      finalizeDockJob("job-fin-c");
      expect(readJobs()[0].status).toBe("failed");
    });

    it("ignores a job that was never seeded", () => {
      finalizeDockJob("ghost");
      expect(readJobs()).toHaveLength(0);
    });

    it("does not resurrect a dismissed job", () => {
      seedLibrary("job-fin-d", ["Alpha"]);
      dismissDockJob("job-fin-d");
      markDockItem("job-fin-d", "0", "done");
      finalizeDockJob("job-fin-d");
      expect(hasDockJob("job-fin-d")).toBe(false);
    });
  });
});
