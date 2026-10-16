import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import enMutations from "@modules/i18n/messages/en/mutations.json";

interface MutationOptions {
  onSuccess?: (data: unknown) => unknown;
  onError?: (err: unknown) => void;
}

const spies = vi.hoisted(() => {
  const captured: { order?: MutationOptions } = {};
  return {
    captured,
    invalidateSettings: vi.fn(),
    invalidateAvailability: vi.fn(),
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
      settings: {
        get: { invalidate: spies.invalidateSettings },
        downloadSourcesAvailability: { invalidate: spies.invalidateAvailability },
      },
    }),
    settings: {
      updateDownloadSources: { useMutation: () => ({ mutateAsync: vi.fn(), isPending: false }) },
      updateDownloadSourceOrder: {
        useMutation: (options: MutationOptions) => {
          spies.captured.order = options;
          return { mutateAsync: vi.fn(), isPending: false };
        },
      },
    },
  },
}));

import { useUpdateDownloadSourceOrder } from "../useDownloadSources";

function deferred() {
  let resolve: () => void = () => undefined;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

beforeEach(() => {
  vi.clearAllMocks();
  spies.captured.order = undefined;
  spies.invalidateSettings.mockResolvedValue(undefined);
  spies.invalidateAvailability.mockResolvedValue(undefined);
});

describe("useUpdateDownloadSourceOrder", () => {
  it("refreshes the settings and the availability, then confirms", async () => {
    renderHook(() => useUpdateDownloadSourceOrder());
    await spies.captured.order?.onSuccess?.(undefined);

    expect(spies.invalidateSettings).toHaveBeenCalledOnce();
    expect(spies.invalidateAvailability).toHaveBeenCalledOnce();
    expect(spies.toastSuccess).toHaveBeenCalledWith(enMutations.settings.downloadSourceOrderSaved);
  });

  it("holds the mutation open until both refreshes land", async () => {
    const settings = deferred();
    const available = deferred();
    spies.invalidateSettings.mockReturnValue(settings.promise);
    spies.invalidateAvailability.mockReturnValue(available.promise);
    renderHook(() => useUpdateDownloadSourceOrder());

    let settled = false;
    const done = Promise.resolve(spies.captured.order?.onSuccess?.(undefined)).then(() => {
      settled = true;
    });

    settings.resolve();
    await Promise.resolve();
    await Promise.resolve();
    expect(settled).toBe(false);
    expect(spies.toastSuccess).not.toHaveBeenCalled();

    available.resolve();
    await done;
    expect(settled).toBe(true);
    expect(spies.toastSuccess).toHaveBeenCalledOnce();
  });

  it("falls back to its own failure copy when the server sent no code", () => {
    renderHook(() => useUpdateDownloadSourceOrder());
    spies.captured.order?.onError?.(new Error("boom"));

    expect(spies.toastError).toHaveBeenCalledWith(enMutations.settings.downloadSourceOrderFailed);
    expect(spies.toastSuccess).not.toHaveBeenCalled();
  });
});
