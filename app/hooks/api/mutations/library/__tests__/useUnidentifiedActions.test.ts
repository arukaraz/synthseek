import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

interface MutationOptions {
  onSuccess?: (data: unknown, variables: unknown) => void;
  onError?: (err: unknown) => void;
}

interface ToastOptions {
  action?: { label: string; onClick: () => void };
}

const spies = vi.hoisted(() => {
  const captured: Record<string, MutationOptions | undefined> = {};
  return {
    captured,
    invalidateList: vi.fn(),
    invalidateStatus: vi.fn(),
    invalidateDuplicates: vi.fn(),
    unignore: vi.fn(),
    errorToast: vi.fn(),
    toastSuccess: vi.fn<(message: string, options?: ToastOptions) => void>(),
    toastInfo: vi.fn(),
    toastWarning: vi.fn(),
  };
});

vi.mock("sonner", () => ({
  toast: { success: spies.toastSuccess, info: spies.toastInfo, warning: spies.toastWarning },
}));

vi.mock("@modules/errors", () => ({ errorToast: spies.errorToast }));

function procedure(name: string) {
  return {
    useMutation: (options: MutationOptions) => {
      spies.captured[name] = options;
      return { mutate: vi.fn(), isPending: false };
    },
  };
}

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({
      library: {
        scan: {
          status: { invalidate: spies.invalidateStatus },
          duplicateGroups: { invalidate: spies.invalidateDuplicates },
          unidentified: { list: { invalidate: spies.invalidateList } },
        },
      },
      client: { library: { scan: { unidentified: { unignore: { mutate: spies.unignore } } } } },
    }),
    library: {
      scan: {
        unidentified: {
          ignore: procedure("ignore"),
          assign: procedure("assign"),
        },
      },
    },
  },
}));

import { useAssignUnidentified, useIgnoreUnidentified } from "../useUnidentifiedActions";

beforeEach(() => {
  vi.clearAllMocks();
  spies.unignore.mockResolvedValue({ restored: 2 });
});

function undoAction(): { label: string; onClick: () => void } {
  const options = spies.toastSuccess.mock.calls[0]?.[1];
  if (options?.action === undefined) throw new Error("the toast offered no undo");
  return options.action;
}

describe("useIgnoreUnidentified", () => {
  it("offers an undo that brings the same files back without searching them again", async () => {
    renderHook(() => useIgnoreUnidentified());
    spies.captured.ignore?.onSuccess?.({ ignored: 2 }, { fileIds: ["a", "b"] });

    undoAction().onClick();

    expect(spies.unignore).toHaveBeenCalledWith({ fileIds: ["a", "b"], searchAgain: false });
    await waitFor(() => expect(spies.invalidateList).toHaveBeenCalledTimes(2));
  });

  it("reports an undo that failed", async () => {
    spies.unignore.mockRejectedValue(new Error("offline"));
    renderHook(() => useIgnoreUnidentified());
    spies.captured.ignore?.onSuccess?.({ ignored: 1 }, { fileIds: ["a"] });

    undoAction().onClick();

    await waitFor(() => expect(spies.errorToast).toHaveBeenCalled());
  });

  it("says nothing when no file was ignored", () => {
    renderHook(() => useIgnoreUnidentified());
    spies.captured.ignore?.onSuccess?.({ ignored: 0 }, { fileIds: ["a"] });

    expect(spies.toastSuccess).not.toHaveBeenCalled();
    expect(spies.invalidateList).toHaveBeenCalledOnce();
  });
});

describe("useAssignUnidentified", () => {
  it("tells apart what was added, filed as a second copy, ignored and left out", () => {
    renderHook(() => useAssignUnidentified());
    spies.captured.assign?.onSuccess?.({ added: 3, alternates: 1, ignored: 2, skipped: 1 }, undefined);

    expect(spies.toastSuccess).toHaveBeenCalledTimes(2);
    expect(spies.toastInfo).toHaveBeenCalledOnce();
    expect(spies.toastWarning).toHaveBeenCalledOnce();
    expect(spies.invalidateDuplicates).toHaveBeenCalledOnce();
  });
});
