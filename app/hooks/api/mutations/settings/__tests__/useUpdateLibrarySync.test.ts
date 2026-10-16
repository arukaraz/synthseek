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
    toastSuccess: vi.fn(),
    toastError: vi.fn(),
    toastWarning: vi.fn(),
  };
});

vi.mock("sonner", () => ({
  toast: { success: spies.toastSuccess, error: spies.toastError, warning: spies.toastWarning },
}));

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({
      settings: { get: { invalidate: spies.invalidateSettings } },
    }),
    settings: {
      updateLibrary: {
        useMutation: (options: MutationOptions) => {
          spies.captured.update = options;
          return { mutateAsync: vi.fn(), isPending: false };
        },
      },
    },
  },
}));

import { useUpdateLibrarySync } from "../useUpdateLibrarySync";

beforeEach(() => {
  vi.clearAllMocks();
  spies.captured.update = undefined;
});

describe("useUpdateLibrarySync", () => {
  it("saves through the library settings procedure", () => {
    renderHook(() => useUpdateLibrarySync());
    expect(spies.captured.update).toBeDefined();
  });

  it("refreshes the settings and confirms the save", () => {
    renderHook(() => useUpdateLibrarySync());
    spies.captured.update?.onSuccess?.(undefined);

    expect(spies.invalidateSettings).toHaveBeenCalledOnce();
    expect(spies.toastSuccess).toHaveBeenCalledWith(enMutations.settings.librarySyncSaved);
    expect(spies.toastError).not.toHaveBeenCalled();
  });

  it("falls back to its own failure copy when the server sent no code", () => {
    renderHook(() => useUpdateLibrarySync());
    spies.captured.update?.onError?.(new Error("boom"));

    expect(spies.toastError).toHaveBeenCalledWith(enMutations.settings.librarySyncFailed);
    expect(spies.invalidateSettings).not.toHaveBeenCalled();
  });
});
