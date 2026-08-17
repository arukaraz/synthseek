import { beforeEach, describe, expect, it, vi } from "vitest";

import { RequestStatus } from "@api/__generated__/types";
import { trpc } from "@utils/trpc";

import { patchCachedApprovalDecision, patchCachedDetailTracks } from "../helpers";

const setQueriesData = vi.fn();
const getQueriesData = vi.fn(() => [] as Array<[unknown, unknown]>);
const setListData = vi.fn();

vi.mock("@trpc/react-query", () => ({
  getQueryKey: (proc: unknown) => (proc === trpc.requests.getDetail ? ["requests", "getDetail"] : ["wrong-procedure"]),
}));

vi.mock("@utils/trpc", () => ({
  trpc: { requests: { getDetail: {}, getAll: {} } },
}));

const queryClient = { setQueriesData, getQueriesData } as never;
const utils = { requests: { getAll: { setData: setListData } } } as never;

function detail(id: string, tracks: Array<{ id: string; status: string; priority?: number }>, status = "in_progress") {
  return { id, status, tracks };
}

function runDetailUpdater<T>(cached: T) {
  const updater = setQueriesData.mock.calls[0][1];
  return updater(cached);
}

beforeEach(() => {
  setQueriesData.mockClear();
  setListData.mockClear();
  getQueriesData.mockReset();
  getQueriesData.mockReturnValue([]);
});

function cacheHolds(...details: unknown[]) {
  getQueriesData.mockReturnValue(details.map((d, i) => [["requests", "getDetail", i], d]));
}

describe("patchCachedDetailTracks", () => {
  it("targets the request-detail cache, not some other procedure's", () => {
    patchCachedDetailTracks(queryClient, (track) => track);

    expect(setQueriesData.mock.calls[0][0]).toEqual({ queryKey: ["requests", "getDetail"] });
  });

  it("patches every cached detail when no container is named", () => {
    patchCachedDetailTracks(queryClient, (track) => ({ ...track, priority: 1 }));

    const next = runDetailUpdater(detail("alb_other", [{ id: "t1", status: "queued", priority: 0 }]));

    expect(next.tracks[0].priority).toBe(1);
  });

  it("leaves a DIFFERENT container's cached detail untouched when scoped", () => {
    patchCachedDetailTracks(queryClient, (track) => ({ ...track, priority: 1 }), "alb_target");

    const foreign = detail("alb_other", [{ id: "t1", status: "queued", priority: 0 }]);
    const next = runDetailUpdater(foreign);

    expect(next).toBe(foreign);
    expect(next.tracks[0].priority).toBe(0);
  });

  it("patches the named container's cached detail when scoped", () => {
    patchCachedDetailTracks(queryClient, (track) => ({ ...track, priority: 1 }), "alb_target");

    const next = runDetailUpdater(detail("alb_target", [{ id: "t1", status: "queued", priority: 0 }]));

    expect(next.tracks[0].priority).toBe(1);
  });

  it("leaves an empty cache entry alone", () => {
    patchCachedDetailTracks(queryClient, (track) => ({ ...track, priority: 1 }));

    expect(runDetailUpdater(null)).toBeNull();
  });
});

describe("patchCachedApprovalDecision", () => {
  it("flips the approved tracks and rolls a drained container forward", () => {
    patchCachedApprovalDecision(queryClient, utils, ["t1"], RequestStatus.enum.queued);

    const next = runDetailUpdater(
      detail("alb_1", [{ id: "t1", status: RequestStatus.enum.pending_approval }], RequestStatus.enum.pending_approval)
    );

    expect(next.tracks[0].status).toBe(RequestStatus.enum.queued);
    expect(next.status).toBe(RequestStatus.enum.queued);
  });

  it("also flips the LIST item, so the pending badge does not linger for a round trip", () => {
    cacheHolds(
      detail("alb_1", [{ id: "t1", status: RequestStatus.enum.pending_approval }], RequestStatus.enum.pending_approval)
    );

    patchCachedApprovalDecision(queryClient, utils, ["t1"], RequestStatus.enum.queued);

    expect(setListData).toHaveBeenCalledTimes(1);
    const updater = setListData.mock.calls[0][1];
    const next = updater([
      { id: "alb_1", status: RequestStatus.enum.pending_approval },
      { id: "alb_2", status: RequestStatus.enum.pending_approval },
    ]);

    expect(next[0].status).toBe(RequestStatus.enum.queued);
    expect(next[1].status).toBe(RequestStatus.enum.pending_approval);
  });

  it("does NOT touch the list while the container still has a pending track", () => {
    cacheHolds(
      detail(
        "alb_1",
        [
          { id: "t1", status: RequestStatus.enum.pending_approval },
          { id: "t2", status: RequestStatus.enum.pending_approval },
        ],
        RequestStatus.enum.pending_approval
      )
    );

    patchCachedApprovalDecision(queryClient, utils, ["t1"], RequestStatus.enum.queued);

    expect(setListData).not.toHaveBeenCalled();
  });

  it("does not flip a container that was never awaiting approval, even with nothing pending in it", () => {
    cacheHolds(detail("alb_done", [{ id: "t9", status: RequestStatus.enum.complete }], RequestStatus.enum.complete));

    patchCachedApprovalDecision(queryClient, utils, ["t1"], RequestStatus.enum.queued);

    expect(setListData).not.toHaveBeenCalled();
  });

  it("does not touch tracks that are not awaiting approval", () => {
    patchCachedApprovalDecision(queryClient, utils, ["t1"], RequestStatus.enum.queued);

    const next = runDetailUpdater(detail("alb_1", [{ id: "t1", status: RequestStatus.enum.downloading }]));

    expect(next.tracks[0].status).toBe(RequestStatus.enum.downloading);
    expect(setListData).not.toHaveBeenCalled();
  });
});
