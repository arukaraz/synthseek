import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import enMutations from "@modules/i18n/messages/en/mutations.json";

interface MutationOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (err: unknown) => void;
}

const spies = vi.hoisted(() => {
  const captured: { update?: MutationOptions } = {};
  return { captured, invalidateSettings: vi.fn(), toastSuccess: vi.fn(), toastError: vi.fn() };
});

vi.mock("sonner", () => ({
  toast: { success: spies.toastSuccess, error: spies.toastError, info: vi.fn(), warning: vi.fn() },
}));

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({ settings: { get: { invalidate: spies.invalidateSettings } } }),
    settings: {
      updateLibraryEditions: {
        useMutation: (options: MutationOptions) => {
          spies.captured.update = options;
          return { mutate: vi.fn(), isPending: false };
        },
      },
    },
  },
}));

import { useUpdateLibraryEditions } from "../useUpdateLibraryEditions";

describe("useUpdateLibraryEditions", () => {
  beforeEach(() => {
    spies.captured.update = undefined;
    vi.clearAllMocks();
  });

  it("reloads the settings and says the preference was saved", () => {
    renderHook(() => useUpdateLibraryEditions());

    spies.captured.update?.onSuccess?.({ ok: true });

    expect(spies.invalidateSettings).toHaveBeenCalledTimes(1);
    expect(spies.toastSuccess).toHaveBeenCalledWith(enMutations.settings.libraryEditionsSaved);
  });

  it("toasts the fallback error message on failure", () => {
    renderHook(() => useUpdateLibraryEditions());

    spies.captured.update?.onError?.(new Error("boom"));

    expect(spies.invalidateSettings).not.toHaveBeenCalled();
    expect(spies.toastError).toHaveBeenCalledWith(enMutations.settings.libraryEditionsFailed);
  });
});
