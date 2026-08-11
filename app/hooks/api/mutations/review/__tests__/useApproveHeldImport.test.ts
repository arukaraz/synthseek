import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

type ApproveResult =
  | { outcome: "imported"; heldImportId: string; trackRequestId: string; vetoRemoved: number }
  | {
      outcome: "already_in_library";
      heldImportId: string;
      trackRequestId: string;
      vetoRemoved: number;
      fileRemoved: boolean;
    }
  | { outcome: "already_in_progress"; heldImportId: string }
  | { outcome: "retryable"; heldImportId: string; error: string }
  | { outcome: "failed"; heldImportId: string; error: string };

interface MutationOptions {
  onSuccess?: (data: ApproveResult) => void;
  onError?: (err: Error) => void;
  onSettled?: () => void;
}

const spies = vi.hoisted(() => ({
  captured: {} as { options?: MutationOptions },
  invalidateReview: vi.fn(),
  invalidateRequests: vi.fn(),
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

  it("celebrates a completed import", () => {
    renderHook(() => useApproveHeldImport());

    spies.captured.options?.onSuccess?.({
      outcome: "imported",
      heldImportId: "held-1",
      trackRequestId: "track-1",
      vetoRemoved: 1,
    });

    expect(toast.success).toHaveBeenCalledWith("mutations:review.imported.title", {
      description: "mutations:review.imported.description",
    });
  });

  it("reports a beets duplicate as informational, never as an import that happened", () => {
    renderHook(() => useApproveHeldImport());

    spies.captured.options?.onSuccess?.({
      outcome: "already_in_library",
      heldImportId: "held-1",
      trackRequestId: "track-1",
      vetoRemoved: 1,
      fileRemoved: true,
    });

    expect(toast.info).toHaveBeenCalledWith("mutations:review.alreadyInLibrary.title", {
      description: "mutations:review.alreadyInLibrary.description",
    });
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("keeps the same duplicate toast when the held copy could not be removed", () => {
    renderHook(() => useApproveHeldImport());

    spies.captured.options?.onSuccess?.({
      outcome: "already_in_library",
      heldImportId: "held-1",
      trackRequestId: "track-1",
      vetoRemoved: 0,
      fileRemoved: false,
    });

    expect(toast.info).toHaveBeenCalledWith("mutations:review.alreadyInLibrary.title", {
      description: "mutations:review.alreadyInLibrary.description",
    });
  });

  it("reports a concurrent approval as informational, not as a success", () => {
    renderHook(() => useApproveHeldImport());

    spies.captured.options?.onSuccess?.({ outcome: "already_in_progress", heldImportId: "held-1" });

    expect(toast.info).toHaveBeenCalledWith("mutations:review.alreadyInProgress.title", {
      description: "mutations:review.alreadyInProgress.description",
    });
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("warns that a pre-move failure left the file approvable again", () => {
    renderHook(() => useApproveHeldImport());

    spies.captured.options?.onSuccess?.({
      outcome: "retryable",
      heldImportId: "held-1",
      error: "importFailedBeforeMove",
    });

    expect(toast.warning).toHaveBeenCalledWith("mutations:review.retryable.title", {
      description: "mutations:review.retryable.description",
    });
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("errors on a post-move failure", () => {
    renderHook(() => useApproveHeldImport());

    spies.captured.options?.onSuccess?.({ outcome: "failed", heldImportId: "held-1", error: "importFailedAfterMove" });

    expect(toast.error).toHaveBeenCalledWith("mutations:review.failed.title", {
      description: "mutations:review.failed.description",
    });
  });

  it("surfaces a rejected approval through the shared error toast", () => {
    renderHook(() => useApproveHeldImport());

    spies.captured.options?.onError?.(new Error("boom"));

    expect(errorToast).toHaveBeenCalledWith(expect.any(Error), "review.approveFailed");
  });

  it("refreshes the review queue and the requests list on settle", () => {
    renderHook(() => useApproveHeldImport());

    spies.captured.options?.onSettled?.();

    expect(spies.invalidateReview).toHaveBeenCalledTimes(1);
    expect(spies.invalidateRequests).toHaveBeenCalledTimes(1);
  });
});
