import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@api/__generated__/types";

type ApproveResult = inferRouterOutputs<AppRouter>["requests"]["review"]["approve"];

interface MutationOptions {
  onSuccess?: (data: ApproveResult, variables: { id: string }) => void;
  onError?: (err: Error, variables: { id: string }) => void;
  onSettled?: () => void;
}

const spies = vi.hoisted(() => ({
  captured: {} as { options?: MutationOptions },
  invalidateReview: vi.fn(),
  invalidateRequests: vi.fn(),
  markReviewApprovalStarted: vi.fn(),
  failReviewApproval: vi.fn(),
}));

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({
      requests: {
        review: { list: { invalidate: spies.invalidateReview } },
        getAll: { invalidate: spies.invalidateRequests },
      },
    }),
    requests: {
      review: {
        approve: {
          useMutation: (options: MutationOptions) => {
            spies.captured.options = options;
            return { mutate: vi.fn(), isPending: false };
          },
        },
      },
    },
  },
}));

vi.mock("@hooks/api/subscriptions", () => ({
  markReviewApprovalStarted: (key: string) => spies.markReviewApprovalStarted(key),
  failReviewApproval: (key: string) => spies.failReviewApproval(key),
}));

vi.mock("@modules/errors", () => ({ errorToast: vi.fn() }));
vi.mock("@locale", () => ({ default: { t: (key: string) => key } }));
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), info: vi.fn(), warning: vi.fn(), error: vi.fn() },
}));

import { errorToast } from "@modules/errors";
import { toast } from "sonner";

import { useApproveHeldImport } from "../useApproveHeldImport";

describe("useApproveHeldImport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    spies.captured.options = undefined;
  });

  it("stays quiet when the import is queued, because the progress dock is the feedback", () => {
    renderHook(() => useApproveHeldImport());

    spies.captured.options?.onSuccess?.({ outcome: "started", heldImportId: "held-1" }, { id: "held-1" });

    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.info).not.toHaveBeenCalled();
  });

  it("tells the dock the server has the row, so a stale error stops reading as this attempt's", () => {
    renderHook(() => useApproveHeldImport());

    spies.captured.options?.onSuccess?.({ outcome: "started", heldImportId: "held-1" }, { id: "held-1" });

    expect(spies.markReviewApprovalStarted).toHaveBeenCalledWith("held-1");
  });

  it("treats an approval already claimed elsewhere as in flight too", () => {
    renderHook(() => useApproveHeldImport());

    spies.captured.options?.onSuccess?.({ outcome: "already_in_progress", heldImportId: "held-1" }, { id: "held-1" });

    expect(spies.markReviewApprovalStarted).toHaveBeenCalledWith("held-1");
  });

  it("reports a concurrent approval as informational, not as a success", () => {
    renderHook(() => useApproveHeldImport());

    spies.captured.options?.onSuccess?.({ outcome: "already_in_progress", heldImportId: "held-1" }, { id: "held-1" });

    expect(toast.info).toHaveBeenCalledWith("mutations:review.alreadyInProgress.title", {
      description: "mutations:review.alreadyInProgress.description",
    });
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("surfaces a rejected approval through the shared error toast", () => {
    renderHook(() => useApproveHeldImport());

    spies.captured.options?.onError?.(new Error("boom"), { id: "held-1" });

    expect(errorToast).toHaveBeenCalledWith(expect.any(Error), "review.approveFailed");
  });

  it("releases the row back into the list when the approval never reached the server", () => {
    renderHook(() => useApproveHeldImport());

    spies.captured.options?.onError?.(new Error("boom"), { id: "held-1" });

    expect(spies.failReviewApproval).toHaveBeenCalledWith("held-1");
  });

  it("refreshes the review queue and the requests list on settle", () => {
    renderHook(() => useApproveHeldImport());

    spies.captured.options?.onSettled?.();

    expect(spies.invalidateReview).toHaveBeenCalledTimes(1);
    expect(spies.invalidateRequests).toHaveBeenCalledTimes(1);
  });
});
