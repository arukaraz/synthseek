import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RetryTracksResult } from "@utils/request-helpers";

import { useRetryStorageFailures } from "../useRetryStorageFailures";

interface MutationOptions {
  onSettled?: () => void;
  onSuccess?: (result: RetryTracksResult) => void;
}

interface CapturedOptions {
  options?: MutationOptions;
}

const spies = vi.hoisted(() => {
  const captured: CapturedOptions = {};
  return {
    captured,
    invalidate: vi.fn(),
    summaryInvalidate: vi.fn(),
    toastSuccess: vi.fn(),
    toastWarning: vi.fn(),
    toastInfo: vi.fn(),
  };
});

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({
      requests: {
        getAll: { invalidate: spies.invalidate },
        getStorageFailureSummary: { invalidate: spies.summaryInvalidate },
      },
      library: { getTracks: { invalidate: spies.invalidate }, getCounts: { invalidate: spies.invalidate } },
      contentDetail: {
        albumDetail: { invalidate: spies.invalidate },
        artistTopTracks: { invalidate: spies.invalidate },
        playlistDetail: { invalidate: spies.invalidate },
      },
    }),
    requests: {
      retryStorageFailures: {
        useMutation: (options: MutationOptions) => {
          spies.captured.options = options;
          return { mutate: vi.fn(), isPending: false };
        },
      },
    },
  },
}));

vi.mock("@locale", () => ({
  default: { t: (key: string, vars?: Record<string, unknown>) => (vars ? `${key}:${JSON.stringify(vars)}` : key) },
}));

vi.mock("sonner", () => ({
  toast: { success: spies.toastSuccess, warning: spies.toastWarning, info: spies.toastInfo },
}));

describe("useRetryStorageFailures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    spies.captured.options = undefined;
  });

  it("refreshes the storage-failure summary once the retry settles", () => {
    renderHook(() => useRetryStorageFailures());

    spies.captured.options?.onSettled?.();

    expect(spies.summaryInvalidate).toHaveBeenCalledTimes(1);
  });

  it("reports the retried count when every storage failure was retried", () => {
    renderHook(() => useRetryStorageFailures());

    spies.captured.options?.onSuccess?.({ requested: 2, retried: 2, skipped: [], refusal: null });

    expect(spies.toastSuccess).toHaveBeenCalledWith('mutations:requests.tracksRetried:{"count":2}', {
      description: undefined,
    });
  });

  it("says how many tracks it retried when a quota stopped the rest", () => {
    renderHook(() => useRetryStorageFailures());

    spies.captured.options?.onSuccess?.({
      requested: 3,
      retried: 1,
      skipped: [
        { id: "b", reason: "quotaExceeded" },
        { id: "c", reason: "quotaExceeded" },
      ],
      refusal: { appCode: "QUOTA_LIBRARY_FULL", appParams: {}, message: "The library is full" },
    });

    expect(spies.toastWarning).toHaveBeenCalledTimes(1);
    expect(spies.toastWarning.mock.calls[0][0]).toBe('mutations:requests.tracksRetriedUntilQuota:{"count":1}');
    expect(spies.toastSuccess).not.toHaveBeenCalled();
  });
});
