import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

import { useSyncAllPlaylistsToPlex } from "../useSyncAllPlaylistsToPlex";

interface SyncResult {
  started: boolean;
  running: boolean;
  synced: number;
  total: number;
}

interface PlexSyncState {
  running: boolean;
  synced: number;
  total: number;
}

interface MutationOptions {
  onSuccess?: (data: SyncResult) => void;
  onError?: (error: { message?: string }) => void;
}

interface CapturedOptions {
  options?: MutationOptions;
}

const spies = vi.hoisted(() => {
  const captured: CapturedOptions = {};
  return {
    setData: vi.fn(),
    errorToast: vi.fn(),
    captured,
  };
});

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({
      requests: {
        getPlexSyncAllState: { setData: spies.setData },
      },
    }),
    requests: {
      syncAllPlaylistsToPlex: {
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

describe("useSyncAllPlaylistsToPlex", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    spies.captured.options = undefined;
  });

  it("on a fresh start seeds the running sync state", () => {
    renderHook(() => useSyncAllPlaylistsToPlex());

    spies.captured.options?.onSuccess?.({ started: true, running: true, synced: 0, total: 8 });

    const setCall = spies.setData.mock.calls[0];
    const seeded: PlexSyncState = setCall[1];
    expect(seeded).toEqual({ running: true, synced: 0, total: 8 });
  });

  it("when a run was already active does not surface a failure toast", () => {
    renderHook(() => useSyncAllPlaylistsToPlex());

    spies.captured.options?.onSuccess?.({ started: false, running: true, synced: 3, total: 8 });

    expect(spies.errorToast).not.toHaveBeenCalled();
    const seeded: PlexSyncState = spies.setData.mock.calls[0][1];
    expect(seeded.running).toBe(true);
  });

  it("on error delegates to errorToast with the sync fallback key", () => {
    renderHook(() => useSyncAllPlaylistsToPlex());

    const error = { message: "Plex unreachable" };
    spies.captured.options?.onError?.(error);

    expect(spies.errorToast).toHaveBeenCalledWith(error, "requests.syncAllPlexFailed");
  });
});
