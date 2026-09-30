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
    invalidateUsers: vi.fn(),
    invalidateMyQuota: vi.fn(),
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
      users: { list: { invalidate: spies.invalidateUsers } },
      requests: { myQuota: { invalidate: spies.invalidateMyQuota } },
    }),
    settings: {
      updateQuotas: {
        useMutation: (options: MutationOptions) => {
          spies.captured.update = options;
          return { mutateAsync: vi.fn(), isPending: false };
        },
      },
    },
  },
}));

import { useUpdateQuotas } from "../useUpdateQuotas";

beforeEach(() => {
  vi.clearAllMocks();
  spies.captured.update = undefined;
});

describe("useUpdateQuotas", () => {
  it("refreshes the settings, the members' usage, and the caller's own quota after saving", () => {
    renderHook(() => useUpdateQuotas());
    spies.captured.update?.onSuccess?.(undefined);

    expect(spies.invalidateSettings).toHaveBeenCalledOnce();
    expect(spies.invalidateUsers).toHaveBeenCalledOnce();
    expect(spies.invalidateMyQuota).toHaveBeenCalledOnce();
    expect(spies.toastSuccess).toHaveBeenCalledWith(enMutations.settings.quotasSaved);
  });

  it("falls back to its own failure copy when the server sent no code", () => {
    renderHook(() => useUpdateQuotas());
    spies.captured.update?.onError?.(new Error("boom"));

    expect(spies.toastError).toHaveBeenCalledWith(enMutations.settings.quotasFailed);
  });
});
