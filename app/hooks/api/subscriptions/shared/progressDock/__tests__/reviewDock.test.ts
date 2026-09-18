import { beforeEach, describe, expect, it } from "vitest";

import { REVIEW_DOCK_ID } from "../constants";
import {
  enqueueReviewApproval,
  failReviewApproval,
  markReviewApprovalStarted,
  reconcileReviewDock,
  reviewApprovalsInFlight,
} from "../reviewDock";
import type { ReviewDockRow } from "../reviewDock";
import { getDockJob, resetDockStore } from "../store";
import type { DockJob } from "../types";

const job = () => getDockJob(REVIEW_DOCK_ID);
const stateOf = (key: string) => job()?.items.find((item) => item.key === key)?.state;
const snapshot = (): DockJob[] => {
  const current = job();
  return current ? [current] : [];
};

const waiting = (id: string): ReviewDockRow => ({ id, importing: false, failed: false, hasError: false });
const importing = (id: string): ReviewDockRow => ({ id, importing: true, failed: false, hasError: false });
const terminalFailure = (id: string): ReviewDockRow => ({ id, importing: false, failed: true, hasError: true });
const returnedWithError = (id: string): ReviewDockRow => ({ id, importing: false, failed: false, hasError: true });

describe("reviewDock", () => {
  beforeEach(() => {
    resetDockStore();
  });

  it("opens one job on the first approval and accumulates the rest into it", () => {
    enqueueReviewApproval({ key: "a", name: "Artist - A" });
    enqueueReviewApproval({ key: "b", name: "Artist - B" });

    expect(job()?.kind).toBe("review-approve");
    expect(job()?.items.map((item) => item.key)).toEqual(["a", "b"]);
    expect(job()?.status).toBe("running");
  });

  it("keeps every approval in one dock even when an earlier import settles between clicks", () => {
    enqueueReviewApproval({ key: "a", name: "Artist - A" });
    reconcileReviewDock([]);
    expect(job()?.status).not.toBe("running");

    enqueueReviewApproval({ key: "b", name: "Artist - B" });
    enqueueReviewApproval({ key: "c", name: "Artist - C" });

    expect(job()?.items.map((item) => item.key)).toEqual(["a", "b", "c"]);
    expect(job()?.status).toBe("running");
    expect(reviewApprovalsInFlight(snapshot())).toEqual(new Set(["a", "b", "c"]));
  });

  it("does not list a row twice when the operator double-clicks Approve", () => {
    enqueueReviewApproval({ key: "a", name: "Artist - A" });
    enqueueReviewApproval({ key: "a", name: "Artist - A" });

    expect(job()?.items).toHaveLength(1);
  });

  it("marks an approval done once its row is no longer held", () => {
    enqueueReviewApproval({ key: "a", name: "Artist - A" });
    enqueueReviewApproval({ key: "b", name: "Artist - B" });

    reconcileReviewDock([waiting("b")]);

    expect(stateOf("a")).toBe("done");
    expect(stateOf("b")).toBe("pending");
  });

  it("marks an approval failed when its row reached a terminal failure", () => {
    enqueueReviewApproval({ key: "a", name: "Artist - A" });

    reconcileReviewDock([terminalFailure("a")]);

    expect(stateOf("a")).toBe("failed");
  });

  it("shows the row the server is actually working on as importing", () => {
    enqueueReviewApproval({ key: "a", name: "Artist - A" });

    reconcileReviewDock([importing("a")]);

    expect(stateOf("a")).toBe("importing");
    expect(job()?.status).toBe("running");
  });

  it("leaves the job running while any approval is still held without an error", () => {
    enqueueReviewApproval({ key: "a", name: "Artist - A" });

    reconcileReviewDock([waiting("a")]);

    expect(job()?.status).toBe("running");
  });

  it("settles the job once nothing is unresolved, and reports a failure as partial", () => {
    enqueueReviewApproval({ key: "a", name: "Artist - A" });
    enqueueReviewApproval({ key: "b", name: "Artist - B" });

    reconcileReviewDock([terminalFailure("b")]);

    expect(stateOf("a")).toBe("done");
    expect(stateOf("b")).toBe("failed");
    expect(job()?.status).toBe("partial");
  });

  it("does nothing when no approval has been made, so an unrelated refresh cannot open a dock", () => {
    reconcileReviewDock([waiting("a")]);

    expect(job()).toBeNull();
  });

  it("keeps hiding a row for as long as the dock still shows it, so it cannot flicker back", () => {
    enqueueReviewApproval({ key: "a", name: "Artist - A" });
    reconcileReviewDock([]);

    expect(stateOf("a")).toBe("done");
    expect(reviewApprovalsInFlight(snapshot())).toContain("a");
  });

  it("releases a failed row so the operator can see it again and decide", () => {
    enqueueReviewApproval({ key: "a", name: "Artist - A" });
    reconcileReviewDock([terminalFailure("a")]);

    expect(reviewApprovalsInFlight(snapshot())).not.toContain("a");
  });

  it("reads the error a previous attempt left behind as this attempt's failure only once the server has the row", () => {
    enqueueReviewApproval({ key: "a", name: "Artist - A" });

    reconcileReviewDock([returnedWithError("a")]);

    expect(stateOf("a")).toBe("pending");
    expect(job()?.status).toBe("running");
  });

  it("fails an approval whose row came back to the queue carrying a fresh error", () => {
    enqueueReviewApproval({ key: "a", name: "Artist - A" });
    markReviewApprovalStarted("a");

    reconcileReviewDock([returnedWithError("a")]);

    expect(stateOf("a")).toBe("failed");
  });

  it("takes a re-approved row back into the dock after it failed, and settles it on the retry", () => {
    enqueueReviewApproval({ key: "a", name: "Artist - A" });
    enqueueReviewApproval({ key: "b", name: "Artist - B" });
    reconcileReviewDock([terminalFailure("a"), importing("b")]);
    expect(stateOf("a")).toBe("failed");

    enqueueReviewApproval({ key: "a", name: "Artist - A" });

    expect(stateOf("a")).toBe("pending");
    expect(job()?.items).toHaveLength(2);
    expect(reviewApprovalsInFlight(snapshot())).toEqual(new Set(["a", "b"]));

    reconcileReviewDock([]);

    expect(stateOf("a")).toBe("done");
    expect(job()?.status).toBe("complete");
  });

  it("reopens the dock for a retry of the only row in it, instead of reporting a failure for a running import", () => {
    enqueueReviewApproval({ key: "a", name: "Artist - A" });
    failReviewApproval("a");
    expect(job()?.status).toBe("running");

    enqueueReviewApproval({ key: "a", name: "Artist - A" });
    reconcileReviewDock([importing("a")]);

    expect(stateOf("a")).toBe("importing");
    expect(job()?.status).toBe("running");
  });
});
