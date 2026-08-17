import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useApproveTracks } from "../useApproveTracks";

interface ApproveResult {
  requested: number;
  approved: number;
  skipped: { id: string; reason: "notFound" | "notPendingApproval" | "transitionError" }[];
}

interface MutationOptions {
  onMutate?: (vars: { trackIds: string[] }) => Promise<void>;
  onError?: (err: unknown) => void;
  onSuccess?: (result: ApproveResult) => void;
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

describe("useApproveTracks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    spies.captured.options = undefined;
  });

  it("optimistically patches the cached detail", async () => {
    renderHook(() => useApproveTracks());

    await spies.captured.options?.onMutate?.({ trackIds: ["t1"] });

    expect(spies.detailCancel).toHaveBeenCalledTimes(1);
    expect(spies.listCancel).toHaveBeenCalledTimes(1);
    expect(spies.setQueriesData).toHaveBeenCalledTimes(1);
    const updater = spies.setQueriesData.mock.calls[0][1] as (old: unknown) => PatchItem;
    expect(updater(makeItem()).tracks[0].status).toBe("queued");
  });

  it("refetches the detail and toasts on error", () => {
    renderHook(() => useApproveTracks());

    spies.captured.options?.onError?.(new Error("boom"));

    expect(spies.detailInvalidate).toHaveBeenCalledTimes(1);
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

  it("invalidates the requests list and the detail on settle", () => {
    renderHook(() => useApproveTracks());

    spies.captured.options?.onSettled?.();

    expect(spies.invalidate).toHaveBeenCalledTimes(1);
    expect(spies.detailInvalidate).toHaveBeenCalledTimes(1);
  });
});
