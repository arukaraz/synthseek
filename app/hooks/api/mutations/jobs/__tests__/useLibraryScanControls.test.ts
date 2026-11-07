import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

interface MutationOptions {
  onSuccess?: (data: unknown, variables: unknown) => void;
}

const spies = vi.hoisted(() => {
  const captured: { options?: MutationOptions } = {};
  return { captured, toastSuccess: vi.fn(), toastWarning: vi.fn(), invalidate: vi.fn() };
});

vi.mock("sonner", () => ({ toast: { success: spies.toastSuccess, warning: spies.toastWarning } }));

vi.mock("@modules/errors", () => ({ errorToast: vi.fn() }));

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({
      library: {
        scan: { duplicateGroups: { invalidate: spies.invalidate }, status: { invalidate: spies.invalidate } },
      },
      settings: { quarantine: { list: { invalidate: spies.invalidate } } },
    }),
    library: {
      scan: {
        rejectCopies: {
          useMutation: (options: MutationOptions) => {
            spies.captured.options = options;
            return { mutate: vi.fn(), isPending: false };
          },
        },
      },
    },
  },
}));

import { useRejectCopies } from "../useLibraryScanControls";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("rejecting every copy of a track", () => {
  it("says what was rejected and stays quiet about the audio when every copy was heard", () => {
    renderHook(() => useRejectCopies());
    spies.captured.options?.onSuccess?.({ recycled: 2, freedBytes: 10, searching: true, unheard: 0 }, {});

    expect(spies.toastSuccess).toHaveBeenCalledOnce();
    expect(spies.toastWarning).not.toHaveBeenCalled();
  });

  it("warns when a copy's audio could not be read, since a download that sounds like it is not refused", () => {
    renderHook(() => useRejectCopies());
    spies.captured.options?.onSuccess?.({ recycled: 2, freedBytes: 10, searching: false, unheard: 1 }, {});

    expect(spies.toastWarning).toHaveBeenCalledOnce();
    expect(spies.toastWarning).toHaveBeenCalledWith(expect.stringContaining("could not be read"));
  });
});
