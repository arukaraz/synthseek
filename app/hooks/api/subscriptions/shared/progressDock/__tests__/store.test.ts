import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  autoDismiss,
  buildDockItems,
  correlateDockJob,
  dismissDockJob,
  finalizeDockJob,
  findRunningRequestJobId,
  hasDockJob,
  isDockJobDismissed,
  isDockJobRunning,
  markDockItem,
  resetDockStore,
  seedDockJob,
  setDockJobStatus,
  stashPendingTerminal,
  useDockJobs,
} from "../store";
import { settleRequestDockJobByRequestId } from "../requestDock";
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

function seedRequest(id: string, name: string): void {
  seedDockJob({
    id,
    kind: "request",
    items: buildDockItems([{ key: "track-0", name }]),
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

  describe("isDockJobRunning", () => {
    it("reports a freshly seeded job as running", () => {
      seedLibrary("job-run-a", ["Alpha"]);
      expect(isDockJobRunning("job-run-a")).toBe(true);
    });

    it.each(["complete", "partial", "failed"] as const)("reports a %s job as no longer running", (status) => {
      seedLibrary("job-run-b", ["Alpha"]);
      setDockJobStatus("job-run-b", status);
      expect(isDockJobRunning("job-run-b")).toBe(false);
    });

    it("reports an unknown job as not running", () => {
      expect(isDockJobRunning("job-run-ghost")).toBe(false);
    });
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

  describe("request job correlation", () => {
    it("records the requestId and finds the running request job by it", () => {
      seedRequest("req-a", "Album One");
      correlateDockJob("req-a", "pl_async");
      expect(findRunningRequestJobId("pl_async")).toBe("req-a");
    });

    it("does not find a non-request job that happens to carry the same requestId", () => {
      seedLibrary("lib-a", ["Alpha"]);
      correlateDockJob("lib-a", "pl_async");
      expect(findRunningRequestJobId("pl_async")).toBeNull();
    });

    it("does not find a request job once it is no longer running", () => {
      seedRequest("req-b", "Album One");
      correlateDockJob("req-b", "pl_done");
      setDockJobStatus("req-b", "complete");
      expect(findRunningRequestJobId("pl_done")).toBeNull();
    });
  });

  describe("terminal-before-correlation rendezvous", () => {
    function statusOf(id: string): string | undefined {
      return readJobs().find((job) => job.id === id)?.status;
    }

    it("stashes a terminal that arrives before correlation, then applies it on correlate (job ends terminal, not stuck running)", () => {
      seedRequest("rendezvous-a", "Tiny Playlist");

      settleRequestDockJobByRequestId("pl_fast", "complete");
      expect(statusOf("rendezvous-a")).toBe("running");

      correlateDockJob("rendezvous-a", "pl_fast");
      expect(statusOf("rendezvous-a")).toBe("complete");
    });

    it("carries the partial and failed terminal phases through the rendezvous", () => {
      seedRequest("rendezvous-partial", "Tiny Playlist");
      settleRequestDockJobByRequestId("pl_partial", "partial");
      correlateDockJob("rendezvous-partial", "pl_partial");
      expect(statusOf("rendezvous-partial")).toBe("partial");

      seedRequest("rendezvous-failed", "Tiny Playlist");
      settleRequestDockJobByRequestId("pl_failed", "failed");
      correlateDockJob("rendezvous-failed", "pl_failed");
      expect(statusOf("rendezvous-failed")).toBe("failed");
    });

    it("leaves the normal order (correlate then settle) unchanged", () => {
      seedRequest("rendezvous-b", "Normal Playlist");
      correlateDockJob("rendezvous-b", "pl_normal");
      expect(statusOf("rendezvous-b")).toBe("running");

      settleRequestDockJobByRequestId("pl_normal", "complete");
      expect(statusOf("rendezvous-b")).toBe("complete");
    });

    it("consumes the pending entry so a later re-correlation does not re-apply a stale terminal", () => {
      seedRequest("rendezvous-c", "Tiny Playlist");
      settleRequestDockJobByRequestId("pl_consume", "failed");
      correlateDockJob("rendezvous-c", "pl_consume");
      expect(statusOf("rendezvous-c")).toBe("failed");

      seedRequest("rendezvous-c2", "Another Playlist");
      correlateDockJob("rendezvous-c2", "pl_consume");
      expect(statusOf("rendezvous-c2")).toBe("running");
    });

    it("clears a pending terminal on dismiss so a later job reusing the requestId is not falsely settled", () => {
      seedRequest("rendezvous-d", "Tiny Playlist");
      correlateDockJob("rendezvous-d", "pl_dismiss");
      stashPendingTerminal("pl_dismiss", "complete");

      dismissDockJob("rendezvous-d");

      seedRequest("rendezvous-d2", "Reused Id");
      correlateDockJob("rendezvous-d2", "pl_dismiss");
      expect(statusOf("rendezvous-d2")).toBe("running");
    });

    it("clears a pending terminal when the correlated job is re-seeded", () => {
      stashPendingTerminal("pl_reseed", "failed");
      seedRequest("rendezvous-e", "Fresh Job");
      correlateDockJob("rendezvous-e", "pl_reseed");
      expect(statusOf("rendezvous-e")).toBe("failed");

      seedDockJob({
        id: "rendezvous-e2",
        kind: "request",
        requestId: "pl_reseed",
        items: buildDockItems([{ key: "track-0", name: "Re-seeded" }]),
        status: "running",
      });
      correlateDockJob("rendezvous-e2", "pl_reseed");
      expect(statusOf("rendezvous-e2")).toBe("running");
    });
  });

  describe("autoDismiss", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    });

    it("dismisses the job exactly once after the delay elapses", () => {
      seedRequest("auto-a", "Track One");
      setDockJobStatus("auto-a", "complete");
      autoDismiss("auto-a", 5000);

      expect(hasDockJob("auto-a")).toBe(true);
      vi.advanceTimersByTime(4999);
      expect(hasDockJob("auto-a")).toBe(true);
      vi.advanceTimersByTime(1);
      expect(hasDockJob("auto-a")).toBe(false);
      expect(isDockJobDismissed("auto-a")).toBe(true);
    });

    it("does not fire after a manual dismiss clears the pending timer", () => {
      seedRequest("auto-b", "Track One");
      setDockJobStatus("auto-b", "complete");
      autoDismiss("auto-b", 5000);
      dismissDockJob("auto-b");

      expect(() => vi.advanceTimersByTime(10000)).not.toThrow();
      expect(hasDockJob("auto-b")).toBe(false);
    });

    it("clears a pending timer when the same id is re-seeded so a stale timer cannot dismiss the fresh job", () => {
      seedRequest("auto-c", "Track One");
      setDockJobStatus("auto-c", "complete");
      autoDismiss("auto-c", 5000);

      seedRequest("auto-c", "Track Two");
      vi.advanceTimersByTime(5000);

      expect(hasDockJob("auto-c")).toBe(true);
    });

    it("supersedes an earlier timer when re-armed for the same id", () => {
      seedRequest("auto-d", "Track One");
      setDockJobStatus("auto-d", "complete");
      autoDismiss("auto-d", 5000);
      autoDismiss("auto-d", 1000);

      vi.advanceTimersByTime(1000);
      expect(hasDockJob("auto-d")).toBe(false);
    });
  });
});
