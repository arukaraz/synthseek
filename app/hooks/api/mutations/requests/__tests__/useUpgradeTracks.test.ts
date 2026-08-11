import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { UpgradeTrackResult } from "@utils/request-helpers";
import { useUpgradeTracks } from "../useUpgradeTracks";

interface MutationOptions {
  onSettled?: () => void;
  onSuccess?: (result: { results: UpgradeTrackResult[] }) => void;
  onError?: (error: unknown) => void;
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
    errorToast: vi.fn(),
    notifyBulkUpgradeOutcome: vi.fn(),
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
      upgradeTracks: {
        useMutation: (options: MutationOptions) => {
          spies.captured.options = options;
          return { mutate: vi.fn(), isPending: false };
        },
      },
    },
  },
}));

vi.mock("@modules/errors", () => ({
  errorToast: spies.errorToast,
}));

vi.mock("@utils/request-helpers", () => ({
  notifyBulkUpgradeOutcome: spies.notifyBulkUpgradeOutcome,
}));

describe("useUpgradeTracks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    spies.captured.options = undefined;
  });

  it("on settle invalidates the requests list and both library queries so the upgraded rows refresh", () => {
    renderHook(() => useUpgradeTracks());

    spies.captured.options?.onSettled?.();

    expect(spies.requestsInvalidate).toHaveBeenCalledTimes(1);
    expect(spies.libraryTracksInvalidate).toHaveBeenCalledTimes(1);
    expect(spies.libraryCountsInvalidate).toHaveBeenCalledTimes(1);
    expect(spies.albumDetailInvalidate).toHaveBeenCalledTimes(1);
    expect(spies.artistTopTracksInvalidate).toHaveBeenCalledTimes(1);
    expect(spies.playlistDetailInvalidate).toHaveBeenCalledTimes(1);
  });

  it("hands the per-track results to the shared upgrade notifier", () => {
    renderHook(() => useUpgradeTracks());

    const results: UpgradeTrackResult[] = [
      { outcome: "queued", trackId: "a" },
      { outcome: "skipped", trackId: "b", reason: "notComplete" },
    ];
    spies.captured.options?.onSuccess?.({ results });

    expect(spies.notifyBulkUpgradeOutcome).toHaveBeenCalledWith(results);
  });

  it("routes a rejection through the shared error toast", () => {
    renderHook(() => useUpgradeTracks());

    const error = new Error("boom");
    spies.captured.options?.onError?.(error);

    expect(spies.errorToast).toHaveBeenCalledWith(error, "requests.upgradeTracksFailed");
  });
});
