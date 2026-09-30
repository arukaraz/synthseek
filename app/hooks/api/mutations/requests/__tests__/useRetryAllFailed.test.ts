import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useRetryAllFailed } from "../useRetryAllFailed";

interface RetryAllFailedResult {
  retried: number;
  failed: number;
  refusal: { appCode: string; appParams: Record<string, string | number>; message: string } | null;
}

interface MutationOptions {
  onSettled?: () => void;
  onSuccess?: (result: RetryAllFailedResult) => void;
}

interface CapturedOptions {
  options?: MutationOptions;
}

const spies = vi.hoisted(() => {
  const captured: CapturedOptions = {};
  return {
    captured,
    requestsInvalidate: vi.fn(),
    toastSuccess: vi.fn(),
    toastWarning: vi.fn(),
    toastInfo: vi.fn(),
  };
});

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({ requests: { getAll: { invalidate: spies.requestsInvalidate } } }),
    requests: {
      retryAllFailed: {
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

describe("useRetryAllFailed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    spies.captured.options = undefined;
  });

  it("refreshes the requests list once the retry settles", () => {
    renderHook(() => useRetryAllFailed());

    spies.captured.options?.onSettled?.();

    expect(spies.requestsInvalidate).toHaveBeenCalledTimes(1);
  });

  it("reports the retried count when nothing stopped the run", () => {
    renderHook(() => useRetryAllFailed());

    spies.captured.options?.onSuccess?.({ retried: 4, failed: 0, refusal: null });

    expect(spies.toastSuccess).toHaveBeenCalledWith('mutations:requests.retrying:{"count":4}');
  });

  it("says how many requests it retried when a quota stopped the rest", () => {
    renderHook(() => useRetryAllFailed());

    spies.captured.options?.onSuccess?.({
      retried: 1,
      failed: 0,
      refusal: { appCode: "QUOTA_STORAGE_EXCEEDED", appParams: {}, message: "Storage quota reached" },
    });

    expect(spies.toastWarning).toHaveBeenCalledTimes(1);
    expect(spies.toastWarning.mock.calls[0][0]).toBe('mutations:requests.retryingUntilQuota:{"count":1}');
    expect(spies.toastSuccess).not.toHaveBeenCalled();
  });
});
