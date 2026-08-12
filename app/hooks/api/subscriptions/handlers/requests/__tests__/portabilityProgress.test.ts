import { renderHook } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";

import { SubscriptionEventType, type PortabilityProgressPayload } from "@api/__generated__/types";
import { handlePortabilityProgress } from "../portabilityProgress";
import { subscribePortabilityProgress, type PortabilityProgressUpdate } from "../../../shared/portabilityProgress";
import { buildDockItems, resetDockStore, seedDockJob, useDockJobs } from "../../../shared/progressDock";
import type { DockJob } from "../../../shared/progressDock";

const VIEWER_ID = "u_self";
const OTHER_USER_ID = "u_other";

function makeEvent(overrides: Partial<PortabilityProgressPayload>): PortabilityProgressPayload {
  return {
    eventType: SubscriptionEventType.PortabilityProgress,
    userId: VIEWER_ID,
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

function seedJspf(): void {
  seedDockJob({
    id: "jspf-1",
    kind: "file-import",
    items: buildDockItems([
      { key: "0", name: "First" },
      { key: "1", name: "Second" },
    ]),
    status: "running",
  });
}

beforeEach(() => {
  resetDockStore();
});

describe("handlePortabilityProgress", () => {
  it("emits the per-job preview update", () => {
    const received: PortabilityProgressUpdate[] = [];
    const unsubscribe = subscribePortabilityProgress("jspf-1", (u) => received.push(u));

    handlePortabilityProgress(makeEvent({ phase: "matching", processed: 2, total: 4 }), VIEWER_ID);

    expect(received).toEqual([{ processed: 2, total: 4, phase: "matching" }]);
    unsubscribe();
  });

  it("marks the dock collection by its index key when present", () => {
    seedJspf();

    handlePortabilityProgress(makeEvent({ collection: { key: "1", state: "done" } }), VIEWER_ID);

    expect(jspfJob()?.items.find((item) => item.key === "1")?.state).toBe("done");
    expect(jspfJob()?.items.find((item) => item.key === "0")?.state).toBe("pending");
  });

  it("does nothing to the dock when no collection is present", () => {
    handlePortabilityProgress(makeEvent({ processed: 3, total: 4 }), VIEWER_ID);
    expect(jspfJob()).toBeUndefined();
  });

  it("leaves the dock untouched for another user's import", () => {
    seedJspf();

    handlePortabilityProgress(makeEvent({ userId: OTHER_USER_ID, collection: { key: "1", state: "done" } }), VIEWER_ID);

    expect(jspfJob()?.items.find((item) => item.key === "1")?.state).toBe("pending");
  });

  it("marks the dock while the viewer is unknown", () => {
    seedJspf();

    handlePortabilityProgress(makeEvent({ collection: { key: "1", state: "done" } }), null);

    expect(jspfJob()?.items.find((item) => item.key === "1")?.state).toBe("done");
  });
});
