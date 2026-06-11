import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

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
  resetDockStore();
});

afterEach(() => {
  resetDockStore();
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

  it.each(["complete", "partial", "failed"] as const)(
    "keeps a %s job in the store indefinitely until it is dismissed",
    (status) => {
      seedLibrary("job-f", ["Alpha"]);
      setDockJobStatus("job-f", status);
      expect(readJobs()).toHaveLength(1);
      expect(readJobs()[0].status).toBe(status);
      dismissDockJob("job-f");
      expect(readJobs()).toHaveLength(0);
      expect(isDockJobDismissed("job-f")).toBe(true);
    }
  );

  it("seeding a new job removes a prior terminal job but leaves a running one", () => {
    seedLibrary("job-terminal", ["Alpha"]);
    setDockJobStatus("job-terminal", "complete");
    seedLibrary("job-running", ["Beta"]);
    seedLibrary("job-new", ["Gamma"]);
    const jobs = readJobs();
    const ids = jobs.map((job) => job.id);
    expect(ids).toContain("job-running");
    expect(ids).toContain("job-new");
    expect(ids).not.toContain("job-terminal");
    expect(isDockJobDismissed("job-terminal")).toBe(false);
  });

  it("does not re-add a dismissed terminal job from a late finalize", () => {
    seedLibrary("job-late", ["Alpha"]);
    markDockItem("job-late", "0", "done");
    dismissDockJob("job-late");
    finalizeDockJob("job-late");
    expect(hasDockJob("job-late")).toBe(false);
    expect(readJobs()).toHaveLength(0);
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
