import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { findRunningRequestJobId, resetDockStore, useDockJobs } from "../../../subscriptions/shared/progressDock";
import { usePlaylistRequest } from "../usePlaylistRequest";

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
      contentDetail: { playlistDetail: { invalidate: spies.invalidate } },
    }),
    requests: {
      playlistRequest: {
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
vi.mock("@locale", () => ({ default: { t: (key: string) => key } }));

function playlistVars() {
  return { name: "Workout 70s 80s Rock 120bpm", total_tracks: 64 };
}

function readStatus(jobId: string): string | undefined {
  const { result } = renderHook(() => useDockJobs());
  return result.current.find((job) => job.id === jobId)?.status;
}

describe("usePlaylistRequest dock lifecycle", () => {
  beforeEach(() => {
    resetDockStore();
    spies.captured.options = undefined;
    vi.clearAllMocks();
  });

  it("seeds a running request dock job on mutate so it survives the modal unmounting", () => {
    renderHook(() => usePlaylistRequest());

    const context = spies.captured.options?.onMutate?.(playlistVars());

    expect(context?.dockJobId).toBeTruthy();
    if (context) expect(readStatus(context.dockJobId)).toBe("running");
  });

  it("correlates the seeded job to the playlist id on a created outcome and leaves it running", () => {
    renderHook(() => usePlaylistRequest());

    const context = spies.captured.options?.onMutate?.(playlistVars());
    spies.captured.options?.onSuccess?.(
      { outcome: "created", requestId: "pl_async", data: { name: "Workout 70s 80s Rock 120bpm" }, totalTracks: 64 },
      playlistVars(),
      context
    );

    if (context) {
      expect(readStatus(context.dockJobId)).toBe("running");
      expect(findRunningRequestJobId("pl_async")).toBe(context.dockJobId);
    }
    expect(spies.notifyReclaimOutcome).toHaveBeenCalledTimes(1);
  });

  it("finalizes the seeded job to complete immediately when no populate runs", () => {
    renderHook(() => usePlaylistRequest());

    const context = spies.captured.options?.onMutate?.(playlistVars());
    spies.captured.options?.onSuccess?.(
      { outcome: "already_complete", data: { id: "pl_done", name: "Workout 70s 80s Rock 120bpm" } },
      playlistVars(),
      context
    );

    if (context) {
      expect(readStatus(context.dockJobId)).toBe("complete");
      expect(findRunningRequestJobId("pl_done")).toBeNull();
    }
  });

  it("finalizes the seeded job to failed on hook-level error", () => {
    renderHook(() => usePlaylistRequest());

    const context = spies.captured.options?.onMutate?.(playlistVars());
    spies.captured.options?.onError?.(new Error("boom"), playlistVars(), context);

    if (context) expect(readStatus(context.dockJobId)).toBe("failed");
    expect(spies.errorToastDetailed).toHaveBeenCalledTimes(1);
  });
});
