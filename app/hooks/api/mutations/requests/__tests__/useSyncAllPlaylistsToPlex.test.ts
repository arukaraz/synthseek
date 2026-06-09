import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

import { useSyncAllPlaylistsToPlex } from "../useSyncAllPlaylistsToPlex";

interface SyncResult {
  synced: number;
  failed: number;
}

interface MutationOptions {
  onSuccess?: (data: SyncResult) => void;
  onError?: (error: { message?: string }) => void;
  onSettled?: () => void;
}

interface CapturedOptions {
  options?: MutationOptions;
}

const spies = vi.hoisted(() => {
  const captured: CapturedOptions = {};
  return {
    getAllInvalidate: vi.fn(),
    errorToast: vi.fn(),
    toastSuccess: vi.fn(),
    toastInfo: vi.fn(),
    translate: vi.fn((key: string, vars?: Record<string, unknown>) => (vars ? `${key}:${JSON.stringify(vars)}` : key)),
    captured,
  };
});

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({
      requests: {
        getAll: { invalidate: spies.getAllInvalidate },
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

vi.mock("@locale", () => ({
  default: { t: spies.translate },
}));

vi.mock("sonner", () => ({
  toast: { success: spies.toastSuccess, info: spies.toastInfo },
}));

describe("useSyncAllPlaylistsToPlex", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    spies.captured.options = undefined;
  });

  it("on success with synced playlists shows a success toast carrying count and failed", () => {
    renderHook(() => useSyncAllPlaylistsToPlex());

    spies.captured.options?.onSuccess?.({ synced: 3, failed: 1 });

    expect(spies.translate).toHaveBeenCalledWith("mutations:requests.playlistsSyncedPlex", { count: 3, failed: 1 });
    expect(spies.toastSuccess).toHaveBeenCalledTimes(1);
    expect(spies.toastInfo).not.toHaveBeenCalled();
  });

  it("on success with nothing synced shows the empty info toast", () => {
    renderHook(() => useSyncAllPlaylistsToPlex());

    spies.captured.options?.onSuccess?.({ synced: 0, failed: 0 });

    expect(spies.translate).toHaveBeenCalledWith("mutations:requests.noPlaylistsToSyncPlex");
    expect(spies.toastInfo).toHaveBeenCalledTimes(1);
    expect(spies.toastSuccess).not.toHaveBeenCalled();
  });

  it("on error delegates to errorToast with the sync fallback key", () => {
    renderHook(() => useSyncAllPlaylistsToPlex());

    const error = { message: "Plex unreachable" };
    spies.captured.options?.onError?.(error);

    expect(spies.errorToast).toHaveBeenCalledWith(error, "requests.syncAllPlexFailed");
  });

  it("on settled invalidates the requests getAll cache", () => {
    renderHook(() => useSyncAllPlaylistsToPlex());

    spies.captured.options?.onSettled?.();

    expect(spies.getAllInvalidate).toHaveBeenCalledTimes(1);
  });
});
