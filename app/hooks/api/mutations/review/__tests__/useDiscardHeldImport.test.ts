import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

interface MutationOptions {
  onSuccess?: (data: { heldImportId: string; fileRemoved: boolean }) => void;
  onError?: (err: Error) => void;
  onSettled?: () => void;
}

const spies = vi.hoisted(() => ({
  captured: {} as { options?: MutationOptions },
  invalidateReview: vi.fn(),
}));

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({
      requests: { review: { list: { invalidate: spies.invalidateReview } } },
    }),
    requests: {
      review: {
        discard: {
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
vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));

import { errorToast } from "@modules/errors";
import { toast } from "sonner";

import { useDiscardHeldImport } from "../useDiscardHeldImport";

describe("useDiscardHeldImport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    spies.captured.options = undefined;
  });

  it("confirms the held file was deleted", () => {
    renderHook(() => useDiscardHeldImport());

    spies.captured.options?.onSuccess?.({ heldImportId: "held-1", fileRemoved: true });

    expect(toast.success).toHaveBeenCalledWith("mutations:review.discarded.title", {
      description: "mutations:review.discarded.fileRemoved",
    });
  });

  it("says the file was already gone when nothing was deleted", () => {
    renderHook(() => useDiscardHeldImport());

    spies.captured.options?.onSuccess?.({ heldImportId: "held-1", fileRemoved: false });

    expect(toast.success).toHaveBeenCalledWith("mutations:review.discarded.title", {
      description: "mutations:review.discarded.fileAlreadyGone",
    });
  });

  it("surfaces a rejected discard through the shared error toast", () => {
    renderHook(() => useDiscardHeldImport());

    spies.captured.options?.onError?.(new Error("boom"));

    expect(errorToast).toHaveBeenCalledWith(expect.any(Error), "review.discardFailed");
  });

  it("refreshes the review queue on settle", () => {
    renderHook(() => useDiscardHeldImport());

    spies.captured.options?.onSettled?.();

    expect(spies.invalidateReview).toHaveBeenCalledTimes(1);
  });
});
