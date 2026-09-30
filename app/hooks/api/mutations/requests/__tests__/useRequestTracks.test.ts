import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { resetDockStore, useDockJobs } from "../../../subscriptions/shared/progressDock";
import { useRequestTracks } from "../useRequestTracks";

interface MutationOptions {
  onMutate?: (vars: unknown) => { dockJobId: string } | undefined;
  onError?: (err: unknown, vars: unknown, context: { dockJobId: string } | undefined) => void;
  onSuccess?: (data: unknown, vars: unknown, context: { dockJobId: string } | undefined) => void;
  onSettled?: () => void;
}

const spies = vi.hoisted(() => {
  const captured: { options?: MutationOptions } = {};
  return {
    captured,
    invalidate: vi.fn(),
    notifyTracksRequested: vi.fn(),
    errorToastDetailed: vi.fn(),
  };
});

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({
      requests: { getAll: { invalidate: spies.invalidate } },
      contentDetail: {
        albumDetail: { invalidate: spies.invalidate },
        artistTopTracks: { invalidate: spies.invalidate },
        playlistDetail: { invalidate: spies.invalidate },
      },
    }),
    requests: {
      requestTracks: {
        useMutation: (options: MutationOptions) => {
          spies.captured.options = options;
          return { mutate: vi.fn(), isPending: false };
        },
      },
    },
  },
}));

vi.mock("@modules/errors", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@modules/errors")>()),
  errorToastDetailed: spies.errorToastDetailed,
}));
vi.mock("@utils/request-helpers", () => ({ notifyTracksRequested: spies.notifyTracksRequested }));

function tracksVars() {
  return { tracks: [{}, {}, {}] };
}

function readJob(jobId: string | undefined) {
  const { result } = renderHook(() => useDockJobs());
  return result.current.find((job) => job.id === jobId);
}

describe("useRequestTracks dock lifecycle", () => {
  beforeEach(() => {
    resetDockStore();
    spies.captured.options = undefined;
    vi.clearAllMocks();
  });

  it("seeds a running dock job with one row per requested track", () => {
    renderHook(() => useRequestTracks("Top tracks"));

    const context = spies.captured.options?.onMutate?.(tracksVars());

    expect(readJob(context?.dockJobId)).toMatchObject({ kind: "request", status: "running" });
    expect(readJob(context?.dockJobId)?.items).toHaveLength(3);
  });

  it("settles the dock job as complete when every track was placed", () => {
    renderHook(() => useRequestTracks("Top tracks"));

    const context = spies.captured.options?.onMutate?.(tracksVars());
    spies.captured.options?.onSuccess?.({ created: 3, requeued: 0, failed: 0 }, tracksVars(), context);

    expect(readJob(context?.dockJobId)).toMatchObject({ status: "complete" });
    expect(spies.notifyTracksRequested).toHaveBeenCalledWith({ created: 3, requeued: 0, failed: 0 }, "Top tracks");
  });

  it("settles the dock job as failed when some tracks could not be placed", () => {
    renderHook(() => useRequestTracks("Top tracks"));

    const context = spies.captured.options?.onMutate?.(tracksVars());
    spies.captured.options?.onSuccess?.({ created: 2, requeued: 0, failed: 1 }, tracksVars(), context);

    expect(readJob(context?.dockJobId)).toMatchObject({ status: "failed" });
  });

  it("keeps the quota that refused the tracks on the dock job, so the card can name it", () => {
    renderHook(() => useRequestTracks("Top tracks"));

    const context = spies.captured.options?.onMutate?.(tracksVars());
    spies.captured.options?.onError?.(
      { message: "Request too large", data: { appCode: "QUOTA_REQUEST_TOO_LARGE", appParams: { limit: 2 } } },
      tracksVars(),
      context
    );

    expect(readJob(context?.dockJobId)).toMatchObject({
      status: "failed",
      failure: { appCode: "QUOTA_REQUEST_TOO_LARGE", appParams: { limit: 2 } },
    });
    expect(spies.errorToastDetailed).toHaveBeenCalledTimes(1);
  });
});
