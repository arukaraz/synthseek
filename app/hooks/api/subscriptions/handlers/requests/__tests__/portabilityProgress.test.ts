import { renderHook } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";

import { SubscriptionEventType, type PortabilityProgressPayload } from "@api/__generated__/types";
import { handlePortabilityProgress } from "../portabilityProgress";
import { subscribePortabilityProgress, type PortabilityProgressUpdate } from "../../../shared/portabilityProgress";
import { buildDockItems, resetDockStore, seedDockJob, useDockJobs } from "../../../shared/progressDock";
import type { DockJob } from "../../../shared/progressDock";

function makeEvent(overrides: Partial<PortabilityProgressPayload>): PortabilityProgressPayload {
  return {
    eventType: SubscriptionEventType.PortabilityProgress,
    jobId: "jspf-1",
    phase: "matching",
    processed: 1,
    total: 4,
    ...overrides,
  };
}

function readJobs(): DockJob[] {
  const { result } = renderHook(() => useDockJobs());
  return result.current;
}

function jspfJob(): DockJob | undefined {
  return readJobs().find((job) => job.id === "jspf-1");
}

beforeEach(() => {
  resetDockStore();
});

describe("handlePortabilityProgress", () => {
  it("emits the per-job preview update", () => {
    const received: PortabilityProgressUpdate[] = [];
    const unsubscribe = subscribePortabilityProgress("jspf-1", (u) => received.push(u));

    handlePortabilityProgress(makeEvent({ phase: "matching", processed: 2, total: 4 }));

    expect(received).toEqual([{ processed: 2, total: 4, phase: "matching" }]);
    unsubscribe();
  });

  it("marks the dock collection by its index key when present", () => {
    seedDockJob({
      id: "jspf-1",
      kind: "file-import",
      items: buildDockItems([
        { key: "0", name: "First" },
        { key: "1", name: "Second" },
      ]),
      status: "running",
    });

    handlePortabilityProgress(makeEvent({ collection: { key: "1", state: "done" } }));

    expect(jspfJob()?.items.find((item) => item.key === "1")?.state).toBe("done");
    expect(jspfJob()?.items.find((item) => item.key === "0")?.state).toBe("pending");
  });

  it("does nothing to the dock when no collection is present", () => {
    handlePortabilityProgress(makeEvent({ processed: 3, total: 4 }));
    expect(jspfJob()).toBeUndefined();
  });
});
