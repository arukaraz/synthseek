import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useRejectTracks } from "../useRejectTracks";

interface RejectResult {
  requested: number;
  rejected: number;
  skipped: { id: string; reason: "notFound" | "notPendingApproval" | "transitionError" }[];
}

interface MutationOptions {
  onMutate?: (vars: { trackIds: string[]; reason?: string }) => Promise<void>;
  onError?: (err: unknown) => void;
  onSuccess?: (result: RejectResult) => void;
  onSettled?: () => void;
}

const spies = vi.hoisted(() => {
  const captured: { options?: MutationOptions } = {};
  return {
    captured,
    detailCancel: vi.fn(),
    listCancel: vi.fn(),
    detailInvalidate: vi.fn(),
    setQueriesData: vi.fn(),
    getQueriesData: vi.fn(() => []),
    invalidate: vi.fn(),
    toastSuccess: vi.fn(),
    toastWarning: vi.fn(),
    errorToast: vi.fn(),
  };
});

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ setQueriesData: spies.setQueriesData, getQueriesData: spies.getQueriesData }),
}));

vi.mock("@trpc/react-query", () => ({
  getQueryKey: () => ["requests", "getDetail"],
}));

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({
      requests: {
        getAll: { invalidate: spies.invalidate, setData: vi.fn(), cancel: spies.listCancel },
        getDetail: { cancel: spies.detailCancel, invalidate: spies.detailInvalidate },
      },
    }),
    requests: {
      getDetail: {},
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

  it("optimistically flips the pending tracks to cancelled in the cached detail", async () => {
    renderHook(() => useRejectTracks());

    await spies.captured.options?.onMutate?.({ trackIds: ["t1"], reason: "duplicate" });

    expect(spies.detailCancel).toHaveBeenCalledTimes(1);
    expect(spies.listCancel).toHaveBeenCalledTimes(1);
    const updater = spies.setQueriesData.mock.calls[0][1] as (old: unknown) => PatchItem;
    const patched = updater(makeItem());
    expect(patched.tracks[0].status).toBe("cancelled");
    expect(patched.status).toBe("cancelled");
  });

  it("refetches the detail and toasts on error", () => {
    renderHook(() => useRejectTracks());

    spies.captured.options?.onError?.(new Error("boom"));

    expect(spies.detailInvalidate).toHaveBeenCalledTimes(1);
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
