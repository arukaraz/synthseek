import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RequestStatus } from "@api/__generated__/types";
import { makeRequestsTrack, makeRequestWithTracks } from "@features/requests/__tests__/factories";
import { useRetryTrack } from "../useRetryTrack";

interface MutationOptions {
  onMutate?: (vars: { trackId: string }) => Promise<void>;
  onError?: (err: Error) => void;
  onSettled?: () => void;
}

interface CapturedOptions {
  options?: MutationOptions;
}

const spies = vi.hoisted(() => {
  const captured: CapturedOptions = {};
  return {
    captured,
    requestsInvalidate: vi.fn(),
    detailInvalidate: vi.fn(),
    detailCancel: vi.fn(),
    libraryTracksInvalidate: vi.fn(),
    libraryCountsInvalidate: vi.fn(),
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
        getAll: { invalidate: spies.requestsInvalidate },
        getDetail: { invalidate: spies.detailInvalidate, cancel: spies.detailCancel },
      },
      library: {
        getTracks: { invalidate: spies.libraryTracksInvalidate },
        getCounts: { invalidate: spies.libraryCountsInvalidate },
      },
    }),
    requests: {
      getDetail: {},
      retryTrack: {
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

describe("useRetryTrack", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    spies.captured.options = undefined;
  });

  it("on settle invalidates the requests list, the detail and BOTH library queries so everything refreshes", () => {
    renderHook(() => useRetryTrack());

    spies.captured.options?.onSettled?.();

    expect(spies.requestsInvalidate).toHaveBeenCalledTimes(1);
    expect(spies.detailInvalidate).toHaveBeenCalledTimes(1);
    expect(spies.libraryTracksInvalidate).toHaveBeenCalledTimes(1);
    expect(spies.libraryCountsInvalidate).toHaveBeenCalledTimes(1);
  });

  it("optimistically re-queues the targeted track in the cached detail", async () => {
    renderHook(() => useRetryTrack());

    await spies.captured.options?.onMutate?.({ trackId: "track-1" });

    expect(spies.detailCancel).toHaveBeenCalledTimes(1);
    const updater = spies.setQueriesData.mock.calls[0][1];
    const next = updater(
      makeRequestWithTracks({
        tracks: [
          makeRequestsTrack({ id: "track-1", status: RequestStatus.enum.failed, progress: 40, error: "boom" }),
          makeRequestsTrack({ id: "track-2", status: RequestStatus.enum.failed, progress: 10 }),
        ],
      })
    );

    expect(next.tracks[0]).toMatchObject({ status: RequestStatus.enum.queued, progress: 0, error: null });
    expect(next.tracks[1]).toMatchObject({ status: RequestStatus.enum.failed, progress: 10 });
  });
});
