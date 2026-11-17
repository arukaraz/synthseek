import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import enMutations from "@modules/i18n/messages/en/mutations.json";

interface MutationOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (err: unknown) => void;
}

const spies = vi.hoisted(() => {
  const captured: { update?: MutationOptions } = {};
  return {
    captured,
    invalidateSettings: vi.fn(),
    invalidateGroups: vi.fn(),
    toastSuccess: vi.fn(),
    toastError: vi.fn(),
  };
});

vi.mock("sonner", () => ({
  toast: { success: spies.toastSuccess, error: spies.toastError, info: vi.fn(), warning: vi.fn() },
}));

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({
      settings: { get: { invalidate: spies.invalidateSettings } },
      library: { scan: { duplicateGroups: { invalidate: spies.invalidateGroups } } },
    }),
    settings: {
      updateLibraryDuplicates: {
        useMutation: (options: MutationOptions) => {
          spies.captured.update = options;
          return { mutate: vi.fn(), isPending: false };
        },
      },
    },
  },
}));

import { useUpdateDuplicateResolution } from "../useUpdateDuplicateResolution";

describe("useUpdateDuplicateResolution", () => {
  beforeEach(() => {
    spies.captured.update = undefined;
    vi.clearAllMocks();
  });

  it("reloads the setting and the duplicates list, since the mode decides what the list holds", () => {
    renderHook(() => useUpdateDuplicateResolution());

    spies.captured.update?.onSuccess?.({ ok: true });

    expect(spies.invalidateSettings).toHaveBeenCalledTimes(1);
    expect(spies.invalidateGroups).toHaveBeenCalledTimes(1);
    expect(spies.toastSuccess).toHaveBeenCalledWith(enMutations.settings.duplicateResolutionSaved);
  });

  it("toasts the fallback error message on failure", () => {
    renderHook(() => useUpdateDuplicateResolution());

    spies.captured.update?.onError?.(new Error("boom"));

    expect(spies.toastError).toHaveBeenCalledWith(enMutations.settings.duplicateResolutionFailed);
  });
});
