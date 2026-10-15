import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

interface MutationOptions {
  onSuccess?: (data: unknown) => void;
}

const spies = vi.hoisted(() => {
  const captured: Record<string, MutationOptions | undefined> = {};
  return {
    captured,
    invalidatePaths: vi.fn(),
    invalidateStatus: vi.fn(),
    invalidatePreview: vi.fn(),
    toastSuccess: vi.fn(),
    toastWarning: vi.fn(),
  };
});

vi.mock("sonner", () => ({ toast: { success: spies.toastSuccess, warning: spies.toastWarning } }));

vi.mock("@modules/errors", () => ({ errorToast: vi.fn() }));

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
        paths: { list: { invalidate: spies.invalidatePaths } },
        organise: { status: { invalidate: spies.invalidateStatus }, preview: { invalidate: spies.invalidatePreview } },
      },
    }),
    library: {
      naming: { saveAndOrganise: procedure("saveAndOrganise") },
      organise: { start: procedure("start"), cancel: procedure("cancel") },
    },
  },
}));

import { useStartLibraryOrganise } from "../useLibraryOrganiseControls";
import { useSaveAndOrganise } from "../useLibraryNaming";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useSaveAndOrganise", () => {
  it("rereads the paths, whose stored format just changed", () => {
    renderHook(() => useSaveAndOrganise());

    spies.captured.saveAndOrganise?.onSuccess?.({ outcome: "started" });

    expect(spies.invalidatePaths).toHaveBeenCalled();
    expect(spies.invalidateStatus).toHaveBeenCalled();
    expect(spies.toastSuccess).toHaveBeenCalledOnce();
  });

  it("says the path is gone rather than blaming the format", () => {
    renderHook(() => useSaveAndOrganise());

    spies.captured.saveAndOrganise?.onSuccess?.({ outcome: "not_found" });

    expect(spies.toastWarning).toHaveBeenCalledWith("That library path no longer exists");
  });
});

describe("useStartLibraryOrganise", () => {
  it("says the path is gone rather than calling the plan out of date", () => {
    renderHook(() => useStartLibraryOrganise());

    spies.captured.start?.onSuccess?.({ outcome: "not_found" });

    expect(spies.toastWarning).toHaveBeenCalledWith("That library path no longer exists");
    expect(spies.invalidatePaths).toHaveBeenCalled();
    expect(spies.invalidatePreview).not.toHaveBeenCalled();
  });
});
