import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  findRunningRequestJobId,
  hasDockJob,
  resetDockStore,
  useDockJobs,
} from "../../../subscriptions/shared/progressDock";
import { useRequest } from "../useRequest";

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
    notifyReclaimOutcome: vi.fn(),
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
      request: {
        useMutation: (options: MutationOptions) => {
          spies.captured.options = options;
          return { mutate: vi.fn(), isPending: false };
        },
      },
    },
  },
}));

vi.mock("@modules/errors", () => ({ errorToastDetailed: spies.errorToastDetailed }));
vi.mock("@utils/request-helpers", () => ({ notifyReclaimOutcome: spies.notifyReclaimOutcome }));

function trackVars() {
  return { track: { artist: "Daft Punk", title: "One More Time" } };
}

function readStatus(jobId: string): string | undefined {
  const { result } = renderHook(() => useDockJobs());
  return result.current.find((job) => job.id === jobId)?.status;
}

describe("useRequest dock lifecycle", () => {
  beforeEach(() => {
    resetDockStore();
    spies.captured.options = undefined;
    vi.clearAllMocks();
  });

  it("seeds a running request dock job on mutate regardless of caller mount", () => {
    renderHook(() => useRequest());

    const context = spies.captured.options?.onMutate?.(trackVars());

    expect(context?.dockJobId).toBeTruthy();
    if (context) expect(readStatus(context.dockJobId)).toBe("running");
  });

  it("finalizes the seeded job to complete on hook-level success", () => {
    renderHook(() => useRequest());

    const context = spies.captured.options?.onMutate?.(trackVars());
    spies.captured.options?.onSuccess?.(
      { outcome: "created", data: { artist: "Daft Punk", track: "One More Time" } },
      trackVars(),
      context
    );

    if (context) expect(readStatus(context.dockJobId)).toBe("complete");
    expect(spies.notifyReclaimOutcome).toHaveBeenCalledTimes(1);
  });

  it("finalizes the seeded job to failed on hook-level error", () => {
    renderHook(() => useRequest());

    const context = spies.captured.options?.onMutate?.(trackVars());
    spies.captured.options?.onError?.(new Error("boom"), trackVars(), context);

    if (context) expect(readStatus(context.dockJobId)).toBe("failed");
    expect(spies.errorToastDetailed).toHaveBeenCalledTimes(1);
  });

  it("seeds with the artist-title display name", () => {
    renderHook(() => useRequest());

    const context = spies.captured.options?.onMutate?.(trackVars());

    expect(context?.dockJobId).toBeTruthy();
    if (context) {
      expect(hasDockJob(context.dockJobId)).toBe(true);
      expect(findRunningRequestJobId("nope")).toBeNull();
    }
  });
});
