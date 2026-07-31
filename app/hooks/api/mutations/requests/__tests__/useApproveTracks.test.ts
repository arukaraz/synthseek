import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { patchPendingApprovalTracks, useApproveTracks } from "../useApproveTracks";

interface ApproveResult {
  requested: number;
  approved: number;
  skipped: { id: string; reason: "notFound" | "notPendingApproval" | "transitionError" }[];
}

interface MutationOptions {
  onMutate?: (vars: { trackIds: string[] }) => Promise<{ previous: unknown }>;
  onError?: (err: unknown, vars: { trackIds: string[] }, context: { previous: unknown } | undefined) => void;
  onSuccess?: (result: ApproveResult) => void;
  onSettled?: () => void;
}

const spies = vi.hoisted(() => {
  const captured: { options?: MutationOptions } = {};
  return {
    captured,
    cancel: vi.fn(),
    getData: vi.fn(),
    setData: vi.fn(),
    invalidate: vi.fn(),
    toastSuccess: vi.fn(),
    toastWarning: vi.fn(),
    errorToast: vi.fn(),
  };
});

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({
      requests: {
        getAll: {
          cancel: spies.cancel,
          getData: spies.getData,
          setData: spies.setData,
          invalidate: spies.invalidate,
        },
      },
    }),
    requests: {
      approve: {
        useMutation: (options: MutationOptions) => {
          spies.captured.options = options;
          return { mutate: vi.fn(), isPending: false };
        },
      },
    },
  },
}));

vi.mock("@modules/errors", () => ({ errorToast: spies.errorToast }));

vi.mock("@locale", () => ({
  default: { t: (key: string, vars?: Record<string, unknown>) => (vars ? `${key}:${JSON.stringify(vars)}` : key) },
}));

vi.mock("sonner", () => ({
  toast: { success: spies.toastSuccess, warning: spies.toastWarning },
}));

interface PatchItem {
  status: string;
  tracks: { id: string; status: string }[];
}

function makeItem(overrides: Partial<PatchItem> = {}): PatchItem {
  return {
    status: "pending_approval",
    tracks: [
      { id: "t1", status: "pending_approval" },
      { id: "t2", status: "pending_approval" },
    ],
    ...overrides,
  };
}

type PatchInput = Parameters<typeof patchPendingApprovalTracks>[0];

describe("patchPendingApprovalTracks", () => {
  it("flips the targeted pending tracks and the drained parent status", () => {
    const items = [makeItem()] as unknown as NonNullable<PatchInput>;

    const next = patchPendingApprovalTracks(items, ["t1", "t2"], "queued");

    expect(next?.[0].tracks.map((t) => t.status)).toEqual(["queued", "queued"]);
    expect(next?.[0].status).toBe("queued");
  });

  it("keeps the parent pending while some tracks still await approval", () => {
    const items = [makeItem()] as unknown as NonNullable<PatchInput>;

    const next = patchPendingApprovalTracks(items, ["t1"], "queued");

    expect(next?.[0].tracks.map((t) => t.status)).toEqual(["queued", "pending_approval"]);
    expect(next?.[0].status).toBe("pending_approval");
  });

  it("does not touch tracks that are not pending approval", () => {
    const items = [
      makeItem({ status: "in_progress", tracks: [{ id: "t1", status: "downloading" }] }),
    ] as unknown as NonNullable<PatchInput>;

    const next = patchPendingApprovalTracks(items, ["t1"], "queued");

    expect(next?.[0].tracks[0].status).toBe("downloading");
    expect(next?.[0].status).toBe("in_progress");
  });

  it("returns undefined for an empty cache", () => {
    expect(patchPendingApprovalTracks(undefined, ["t1"], "queued")).toBeUndefined();
  });
});

describe("useApproveTracks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    spies.captured.options = undefined;
  });

  it("optimistically patches the cache and snapshots the previous value", async () => {
    const previous = [makeItem()];
    spies.getData.mockReturnValue(previous);
    renderHook(() => useApproveTracks());

    const context = await spies.captured.options?.onMutate?.({ trackIds: ["t1"] });

    expect(spies.cancel).toHaveBeenCalledTimes(1);
    expect(spies.setData).toHaveBeenCalledTimes(1);
    expect(context?.previous).toBe(previous);

    const updater = spies.setData.mock.calls[0][1] as (old: unknown) => unknown;
    const patched = updater(previous) as PatchItem[];
    expect(patched[0].tracks[0].status).toBe("queued");
  });

  it("rolls back the cache and toasts on error", async () => {
    const previous = [makeItem()];
    spies.getData.mockReturnValue(previous);
    renderHook(() => useApproveTracks());

    const context = await spies.captured.options?.onMutate?.({ trackIds: ["t1"] });
    spies.captured.options?.onError?.(new Error("boom"), { trackIds: ["t1"] }, context);

    expect(spies.setData).toHaveBeenLastCalledWith(undefined, previous);
    expect(spies.errorToast).toHaveBeenCalledWith(expect.any(Error), "requests.approveFailed");
  });

  it("toasts success with the approved count", () => {
    renderHook(() => useApproveTracks());

    spies.captured.options?.onSuccess?.({ requested: 2, approved: 2, skipped: [] });

    expect(spies.toastSuccess).toHaveBeenCalledTimes(1);
    expect(String(spies.toastSuccess.mock.calls[0][0])).toContain("tracksApproved");
  });

  it("warns when everything was skipped", () => {
    renderHook(() => useApproveTracks());

    spies.captured.options?.onSuccess?.({
      requested: 1,
      approved: 0,
      skipped: [{ id: "t1", reason: "notPendingApproval" }],
    });

    expect(spies.toastWarning).toHaveBeenCalledTimes(1);
  });

  it("invalidates the requests list on settle", () => {
    renderHook(() => useApproveTracks());

    spies.captured.options?.onSettled?.();

    expect(spies.invalidate).toHaveBeenCalledTimes(1);
  });
});
