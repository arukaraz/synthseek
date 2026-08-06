import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import enErrors from "@modules/i18n/messages/en/errors.json";
import enMutations from "@modules/i18n/messages/en/mutations.json";

interface MutationOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (err: unknown) => void;
}

const spies = vi.hoisted(() => {
  const captured: { empty?: MutationOptions; update?: MutationOptions } = {};
  return {
    captured,
    invalidateStatus: vi.fn(),
    invalidateSettings: vi.fn(),
    toastSuccess: vi.fn(),
    toastError: vi.fn(),
    toastInfo: vi.fn(),
    toastWarning: vi.fn(),
  };
});

vi.mock("sonner", () => ({
  toast: {
    success: spies.toastSuccess,
    error: spies.toastError,
    info: spies.toastInfo,
    warning: spies.toastWarning,
  },
}));

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({
      settings: {
        get: { invalidate: spies.invalidateSettings },
        recycleBin: { status: { invalidate: spies.invalidateStatus } },
      },
    }),
    settings: {
      updateLibraryRecycleBin: {
        useMutation: (options: MutationOptions) => {
          spies.captured.update = options;
          return { mutate: vi.fn(), isPending: false };
        },
      },
      recycleBin: {
        empty: {
          useMutation: (options: MutationOptions) => {
            spies.captured.empty = options;
            return { mutate: vi.fn(), isPending: false };
          },
        },
      },
    },
  },
}));

import { useEmptyRecycleBin, useUpdateLibraryRecycleBin } from "../useRecycleBin";

describe("useUpdateLibraryRecycleBin", () => {
  beforeEach(() => {
    spies.captured.update = undefined;
    vi.clearAllMocks();
  });

  it("invalidates the settings query and toasts on success", () => {
    renderHook(() => useUpdateLibraryRecycleBin());

    spies.captured.update?.onSuccess?.({ ok: true });

    expect(spies.invalidateSettings).toHaveBeenCalledTimes(1);
    expect(spies.toastSuccess).toHaveBeenCalledWith(enMutations.settings.recycleBinSaved);
  });

  it("toasts the fallback error message on failure", () => {
    renderHook(() => useUpdateLibraryRecycleBin());

    spies.captured.update?.onError?.(new Error("boom"));

    expect(spies.toastError).toHaveBeenCalledWith(enMutations.settings.recycleBinSaveFailed);
  });
});

describe("useEmptyRecycleBin", () => {
  beforeEach(() => {
    spies.captured.empty = undefined;
    vi.clearAllMocks();
  });

  it("invalidates the status query and toasts the pluralized removed count on success", () => {
    renderHook(() => useEmptyRecycleBin());

    spies.captured.empty?.onSuccess?.({ ok: true, removedFiles: 3 });

    expect(spies.invalidateStatus).toHaveBeenCalledTimes(1);
    expect(spies.toastSuccess).toHaveBeenCalledWith("Recycle bin emptied, 3 files removed");
  });

  it("uses the singular form for a single removed file", () => {
    renderHook(() => useEmptyRecycleBin());

    spies.captured.empty?.onSuccess?.({ ok: true, removedFiles: 1 });

    expect(spies.toastSuccess).toHaveBeenCalledWith("Recycle bin emptied, 1 file removed");
  });

  it("translates the RECYCLE_BIN_BUSY appCode error", () => {
    renderHook(() => useEmptyRecycleBin());

    spies.captured.empty?.onError?.({ data: { appCode: "RECYCLE_BIN_BUSY" } });

    expect(spies.toastError).toHaveBeenCalledWith(enErrors.RECYCLE_BIN_BUSY.title, {
      description: enErrors.RECYCLE_BIN_BUSY.description,
      duration: undefined,
    });
  });

  it("falls back to the generic empty-failed message on an uncoded error", () => {
    renderHook(() => useEmptyRecycleBin());

    spies.captured.empty?.onError?.(new Error("boom"));

    expect(spies.toastError).toHaveBeenCalledWith(enMutations.settings.recycleBinEmptyFailed);
  });
});
