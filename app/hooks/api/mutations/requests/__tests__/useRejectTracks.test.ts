import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useRejectTracks } from "../useRejectTracks";

interface RejectResult {
  requested: number;
  rejected: number;
  skipped: { id: string; reason: "notFound" | "notPendingApproval" | "transitionError" }[];
}

interface MutationOptions {
  onMutate?: (vars: { trackIds: string[]; reason?: string }) => Promise<{ previous: unknown }>;
  onError?: (
    err: unknown,
    vars: { trackIds: string[]; reason?: string },
    context: { previous: unknown } | undefined
  ) => void;
  onSuccess?: (result: RejectResult) => void;
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
      reject: {
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

function makeItem(): PatchItem {
  return {
    status: "pending_approval",
    tracks: [{ id: "t1", status: "pending_approval" }],
  };
}

describe("useRejectTracks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    spies.captured.options = undefined;
  });

  it("optimistically flips the pending tracks to cancelled", async () => {
    const previous = [makeItem()];
    spies.getData.mockReturnValue(previous);
    renderHook(() => useRejectTracks());

    await spies.captured.options?.onMutate?.({ trackIds: ["t1"], reason: "duplicate" });

    const updater = spies.setData.mock.calls[0][1] as (old: unknown) => unknown;
    const patched = updater(previous) as PatchItem[];
    expect(patched[0].tracks[0].status).toBe("cancelled");
    expect(patched[0].status).toBe("cancelled");
  });

  it("rolls back and toasts on error", async () => {
    const previous = [makeItem()];
    spies.getData.mockReturnValue(previous);
    renderHook(() => useRejectTracks());

    const context = await spies.captured.options?.onMutate?.({ trackIds: ["t1"] });
    spies.captured.options?.onError?.(new Error("boom"), { trackIds: ["t1"] }, context);

    expect(spies.setData).toHaveBeenLastCalledWith(undefined, previous);
    expect(spies.errorToast).toHaveBeenCalledWith(expect.any(Error), "requests.rejectFailed");
  });

  it("toasts success with the rejected count", () => {
    renderHook(() => useRejectTracks());

    spies.captured.options?.onSuccess?.({ requested: 1, rejected: 1, skipped: [] });

    expect(spies.toastSuccess).toHaveBeenCalledTimes(1);
    expect(String(spies.toastSuccess.mock.calls[0][0])).toContain("tracksRejected");
  });

  it("warns when everything was skipped", () => {
    renderHook(() => useRejectTracks());

    spies.captured.options?.onSuccess?.({
      requested: 1,
      rejected: 0,
      skipped: [{ id: "t1", reason: "transitionError" }],
    });

    expect(spies.toastWarning).toHaveBeenCalledTimes(1);
  });
});
