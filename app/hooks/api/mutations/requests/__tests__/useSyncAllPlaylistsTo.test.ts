import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

import { useSyncAllPlaylistsTo } from "../useSyncAllPlaylistsTo";

interface SyncResult {
  started: boolean;
  running: boolean;
  server: string | null;
  synced: number;
  total: number;
}

interface PlaylistSyncState {
  running: boolean;
  server: string | null;
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
        getPlaylistSyncAllState: { setData: spies.setData },
      },
    }),
    requests: {
      syncAllPlaylistsTo: {
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

describe("useSyncAllPlaylistsTo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    spies.captured.options = undefined;
  });

  it("on a fresh start seeds the running sync state with the server it runs to", () => {
    renderHook(() => useSyncAllPlaylistsTo());

    spies.captured.options?.onSuccess?.({ started: true, running: true, server: "navidrome", synced: 0, total: 8 });

    const seeded: PlaylistSyncState = spies.setData.mock.calls[0][1];
    expect(seeded).toEqual({ running: true, server: "navidrome", synced: 0, total: 8 });
  });

  it("when a run was already active does not surface a failure toast", () => {
    renderHook(() => useSyncAllPlaylistsTo());

    spies.captured.options?.onSuccess?.({ started: false, running: true, server: "plex", synced: 3, total: 8 });

    expect(spies.errorToast).not.toHaveBeenCalled();
    const seeded: PlaylistSyncState = spies.setData.mock.calls[0][1];
    expect(seeded.running).toBe(true);
  });

  it("on error delegates to errorToast with the sync fallback key", () => {
    renderHook(() => useSyncAllPlaylistsTo());

    const error = { message: "Server unreachable" };
    spies.captured.options?.onError?.(error);

    expect(spies.errorToast).toHaveBeenCalledWith(error, "requests.syncAllPlaylistsFailed");
  });
});
