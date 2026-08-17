import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeRequestsTrack, makeRequestWithTracks } from "@features/requests/__tests__/factories";
import { useSetWatch } from "../useSetWatch";

interface SetWatchVars {
  trackId: string;
  enabled: boolean;
}

interface MutationOptions {
  onMutate?: (vars: SetWatchVars) => Promise<void>;
  onError?: (err: Error) => void;
  onSuccess?: (data: { success: boolean; trackId: string; enabled: boolean }) => void;
  onSettled?: () => void;
}

interface CapturedOptions {
  options?: MutationOptions;
}

const spies = vi.hoisted(() => {
  const captured: CapturedOptions = {};
  return {
    captured,
    invalidateAll: vi.fn(),
    invalidateDetail: vi.fn(),
    cancelDetail: vi.fn(),
    setQueriesData: vi.fn(),
  };
});

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ setQueriesData: spies.setQueriesData }),
}));

vi.mock("@trpc/react-query", () => ({
  getQueryKey: () => ["requests", "getDetail"],
}));

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({
      requests: {
        getAll: { invalidate: spies.invalidateAll },
        getDetail: { invalidate: spies.invalidateDetail, cancel: spies.cancelDetail },
      },
    }),
    requests: {
      getDetail: {},
      setWatch: {
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
  default: { t: (key: string) => key },
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn() },
}));

import { errorToast } from "@modules/errors";
import { toast } from "sonner";

function runDetailUpdater(detail: unknown) {
  const updater = spies.setQueriesData.mock.calls[0][1];
  return updater(detail);
}

describe("useSetWatch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    spies.captured.options = undefined;
  });

  it("optimistically disables the watch on the targeted track only", async () => {
    renderHook(() => useSetWatch());

    await spies.captured.options?.onMutate?.({ trackId: "track-1", enabled: false });

    expect(spies.cancelDetail).toHaveBeenCalledTimes(1);
    const watched = makeRequestsTrack({ id: "track-1", watch_enabled: true, retry_count: 4 });
    const other = makeRequestsTrack({ id: "track-2", watch_enabled: true, retry_count: 2 });
    const next = runDetailUpdater(makeRequestWithTracks({ tracks: [watched, other] }));

    expect(next.tracks[0]).toMatchObject({ watch_enabled: false, next_retry_at: null, retry_count: 4 });
    expect(next.tracks[1]).toMatchObject({ watch_enabled: true, retry_count: 2 });
  });

  it("optimistically re-enables the watch and resets the retry counter", async () => {
    renderHook(() => useSetWatch());

    await spies.captured.options?.onMutate?.({ trackId: "track-1", enabled: true });

    const stopped = makeRequestsTrack({ id: "track-1", watch_enabled: false, retry_count: 4 });
    const next = runDetailUpdater(makeRequestWithTracks({ tracks: [stopped] }));

    expect(next.tracks[0]).toMatchObject({ watch_enabled: true, next_retry_at: null, retry_count: 0 });
  });

  it("leaves an empty detail cache entry alone", async () => {
    renderHook(() => useSetWatch());

    await spies.captured.options?.onMutate?.({ trackId: "track-1", enabled: true });

    expect(runDetailUpdater(null)).toBeNull();
  });

  it("refetches the detail and toasts on error", () => {
    renderHook(() => useSetWatch());

    spies.captured.options?.onError?.(new Error("boom"));

    expect(spies.invalidateDetail).toHaveBeenCalledTimes(1);
    expect(errorToast).toHaveBeenCalledWith(expect.any(Error), "requests.setWatchFailed");
  });

  it("toasts the resumed message when the watch was enabled", () => {
    renderHook(() => useSetWatch());

    spies.captured.options?.onSuccess?.({ success: true, trackId: "track-1", enabled: true });

    expect(toast.success).toHaveBeenCalledWith("mutations:requests.watchResumed");
  });

  it("toasts the stopped message when the watch was disabled", () => {
    renderHook(() => useSetWatch());

    spies.captured.options?.onSuccess?.({ success: true, trackId: "track-1", enabled: false });

    expect(toast.success).toHaveBeenCalledWith("mutations:requests.watchStopped");
  });

  it("refetches both the list and the detail on settle", () => {
    renderHook(() => useSetWatch());

    spies.captured.options?.onSettled?.();

    expect(spies.invalidateAll).toHaveBeenCalledTimes(1);
    expect(spies.invalidateDetail).toHaveBeenCalledTimes(1);
  });
});
