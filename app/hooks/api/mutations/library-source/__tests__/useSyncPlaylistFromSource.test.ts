import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import enMutations from "@modules/i18n/messages/en/mutations.json";

type SyncStatus = "synced" | "no_change" | "not_found" | "not_synced_provider";

interface MutationOptions {
  onSuccess?: (data: { status: SyncStatus }) => void;
  onError?: (err: unknown) => void;
}

const spies = vi.hoisted(() => {
  const captured: { options?: MutationOptions } = {};
  return {
    captured,
    invalidateRequests: vi.fn(),
    errorToast: vi.fn(),
    toastSuccess: vi.fn(),
    toastError: vi.fn(),
    toastInfo: vi.fn(),
  };
});

vi.mock("sonner", () => ({
  toast: {
    success: spies.toastSuccess,
    error: spies.toastError,
    info: spies.toastInfo,
  },
}));

vi.mock("@modules/errors", () => ({
  errorToast: spies.errorToast,
}));

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({
      requests: { invalidate: spies.invalidateRequests },
    }),
    librarySource: {
      provider: {
        syncPlaylistNow: {
          useMutation: (options: MutationOptions) => {
            spies.captured.options = options;
            return { mutate: vi.fn(), isPending: false };
          },
        },
      },
    },
  },
}));

import { useSyncPlaylistFromSource } from "../useSyncPlaylistFromSource";

describe("useSyncPlaylistFromSource", () => {
  beforeEach(() => {
    spies.captured.options = undefined;
    vi.clearAllMocks();
  });

  it("refreshes the requests and confirms when the sync queued new tracks", () => {
    renderHook(() => useSyncPlaylistFromSource());

    spies.captured.options?.onSuccess?.({ status: "synced" });

    expect(spies.toastSuccess).toHaveBeenCalledWith(enMutations.librarySource.playlistSyncQueued);
    expect(spies.invalidateRequests).toHaveBeenCalledOnce();
  });

  it("reports an up-to-date playlist without refreshing anything", () => {
    renderHook(() => useSyncPlaylistFromSource());

    spies.captured.options?.onSuccess?.({ status: "no_change" });

    expect(spies.toastInfo).toHaveBeenCalledWith(enMutations.librarySource.playlistUpToDate);
    expect(spies.invalidateRequests).not.toHaveBeenCalled();
  });

  it.each([
    ["not_synced_provider", enMutations.librarySource.playlistNotLinked],
    ["not_found", enMutations.librarySource.playlistNotFound],
  ] satisfies ReadonlyArray<readonly [SyncStatus, string]>)("reports %s as an error", (status, message) => {
    renderHook(() => useSyncPlaylistFromSource());

    spies.captured.options?.onSuccess?.({ status });

    expect(spies.toastError).toHaveBeenCalledWith(message);
    expect(spies.invalidateRequests).not.toHaveBeenCalled();
  });

  it("hands a failed call to the error toast with the playlist sync fallback", () => {
    renderHook(() => useSyncPlaylistFromSource());
    const error = new Error("boom");

    spies.captured.options?.onError?.(error);

    expect(spies.errorToast).toHaveBeenCalledWith(error, "librarySource.playlistSyncFailed");
  });
});
