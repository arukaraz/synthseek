import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DOCK_AUTO_DISMISS_MS } from "../constants";
import {
  buildDockItems,
  dismissDockJob,
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
});
