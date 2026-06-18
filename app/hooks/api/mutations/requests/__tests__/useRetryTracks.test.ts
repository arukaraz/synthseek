import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useRetryTracks } from "../useRetryTracks";

type SkipReason = "notFound" | "forbidden" | "notRetryable" | "retryError";

interface RetryTracksResult {
  requested: number;
  retried: number;
  skipped: { id: string; reason: SkipReason }[];
}

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
    requestsInvalidate: vi.fn(),
    libraryTracksInvalidate: vi.fn(),
    libraryCountsInvalidate: vi.fn(),
    albumDetailInvalidate: vi.fn(),
    artistTopTracksInvalidate: vi.fn(),
    playlistDetailInvalidate: vi.fn(),
    toastSuccess: vi.fn(),
    toastWarning: vi.fn(),
    toastInfo: vi.fn(),
  };
});

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({
      requests: { getAll: { invalidate: spies.requestsInvalidate } },
      library: {
        getTracks: { invalidate: spies.libraryTracksInvalidate },
        getCounts: { invalidate: spies.libraryCountsInvalidate },
      },
      contentDetail: {
        albumDetail: { invalidate: spies.albumDetailInvalidate },
        artistTopTracks: { invalidate: spies.artistTopTracksInvalidate },
        playlistDetail: { invalidate: spies.playlistDetailInvalidate },
      },
    }),
    requests: {
      retryTracks: {
        useMutation: (options: MutationOptions) => {
          spies.captured.options = options;
          return { mutate: vi.fn(), isPending: false };
        },
      },
    },
  },
}));

vi.mock("@modules/errors", () => ({
  errorToast: vi.fn(),
}));

vi.mock("@locale", () => ({
  default: { t: (key: string, vars?: Record<string, unknown>) => (vars ? `${key}:${JSON.stringify(vars)}` : key) },
}));

vi.mock("sonner", () => ({
  toast: { success: spies.toastSuccess, warning: spies.toastWarning, info: spies.toastInfo },
}));

describe("useRetryTracks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    spies.captured.options = undefined;
  });

  it("on settle invalidates the requests list and BOTH library queries so the library refreshes", () => {
    renderHook(() => useRetryTracks());

    spies.captured.options?.onSettled?.();

    expect(spies.requestsInvalidate).toHaveBeenCalledTimes(1);
    expect(spies.libraryTracksInvalidate).toHaveBeenCalledTimes(1);
    expect(spies.libraryCountsInvalidate).toHaveBeenCalledTimes(1);
    expect(spies.albumDetailInvalidate).toHaveBeenCalledTimes(1);
    expect(spies.artistTopTracksInvalidate).toHaveBeenCalledTimes(1);
    expect(spies.playlistDetailInvalidate).toHaveBeenCalledTimes(1);
  });

  it("toasts the retried count on a clean success", () => {
    renderHook(() => useRetryTracks());

    spies.captured.options?.onSuccess?.({ requested: 3, retried: 3, skipped: [] });

    expect(spies.toastSuccess).toHaveBeenCalledWith('mutations:requests.tracksRetried:{"count":3}', {
      description: undefined,
    });
    expect(spies.toastWarning).not.toHaveBeenCalled();
  });

  it("summarizes a partial result, grouping skips by reason in the description", () => {
    renderHook(() => useRetryTracks());

    spies.captured.options?.onSuccess?.({
      requested: 4,
      retried: 2,
      skipped: [
        { id: "a", reason: "notFound" },
        { id: "b", reason: "notFound" },
        { id: "c", reason: "forbidden" },
      ],
    });

    expect(spies.toastSuccess).toHaveBeenCalledTimes(1);
    const call = spies.toastSuccess.mock.calls[0];
    expect(call[0]).toContain("requests.tracksRetried");
    expect(call[1].description).toContain("requests.tracksRetrySkipped");
    expect(call[1].description).toContain("requests.retrySkipNotFound");
    expect(call[1].description).toContain("requests.retrySkipForbidden");
  });

  it("warns when nothing was retried but some were skipped", () => {
    renderHook(() => useRetryTracks());

    spies.captured.options?.onSuccess?.({
      requested: 1,
      retried: 0,
      skipped: [{ id: "a", reason: "notRetryable" }],
    });

    expect(spies.toastWarning).toHaveBeenCalledTimes(1);
    expect(spies.toastSuccess).not.toHaveBeenCalled();
    expect(spies.toastInfo).not.toHaveBeenCalled();
  });

  it("shows the no-failed info toast when nothing was retried and nothing was skipped", () => {
    renderHook(() => useRetryTracks());

    spies.captured.options?.onSuccess?.({ requested: 0, retried: 0, skipped: [] });

    expect(spies.toastInfo).toHaveBeenCalledWith("mutations:requests.noFailedToRetry");
    expect(spies.toastSuccess).not.toHaveBeenCalled();
    expect(spies.toastWarning).not.toHaveBeenCalled();
  });
});
