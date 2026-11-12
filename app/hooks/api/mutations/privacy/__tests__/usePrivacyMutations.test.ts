import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

interface MutationOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: unknown) => void;
  onSettled?: () => void;
}

const spies = vi.hoisted(() => {
  const captured: Record<string, MutationOptions | undefined> = {};
  return {
    captured,
    invalidateAll: vi.fn(),
    invalidateMe: vi.fn(),
    invalidateOverview: vi.fn(),
    invalidateSettings: vi.fn(),
    invalidatePlaylists: vi.fn(),
    invalidateCounts: vi.fn(),
    invalidateRequests: vi.fn(),
    errorToast: vi.fn(),
    toastSuccess: vi.fn(),
  };
});

vi.mock("sonner", () => ({ toast: { success: spies.toastSuccess } }));

vi.mock("@modules/errors", () => ({ errorToast: spies.errorToast }));

vi.mock("@locale", () => ({
  default: { t: (key: string, values?: Record<string, unknown>) => `${key}${values ? JSON.stringify(values) : ""}` },
}));

function procedure(name: string) {
  return {
    useMutation: (options: MutationOptions) => {
      spies.captured[name] = options;
      return { mutate: vi.fn(), isPending: false };
    },
  };
}

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({
      invalidate: spies.invalidateAll,
      auth: { me: { invalidate: spies.invalidateMe } },
      privacy: { overview: { invalidate: spies.invalidateOverview } },
      settings: { get: { invalidate: spies.invalidateSettings } },
      library: {
        getPlaylists: { invalidate: spies.invalidatePlaylists },
        getCounts: { invalidate: spies.invalidateCounts },
      },
      requests: { getAll: { invalidate: spies.invalidateRequests } },
    }),
    privacy: {
      setPrivateSession: procedure("session"),
      clearHistory: procedure("clear"),
      updateServer: procedure("server"),
    },
    playlists: { setVisibility: procedure("visibility") },
  },
}));

import { useSetPlaylistVisibility } from "../../playlists/useSetPlaylistVisibility";
import { useClearListeningHistory, useSetPrivateSession, useUpdateServerPrivacy } from "../usePrivacyMutations";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useSetPrivateSession", () => {
  it("refreshes the signed-in account, which carries when the session ends", () => {
    renderHook(() => useSetPrivateSession());

    spies.captured.session?.onSuccess?.({ privateSessionUntil: null });

    expect(spies.invalidateMe).toHaveBeenCalledOnce();
  });

  it("reports a failure under its own message", () => {
    renderHook(() => useSetPrivateSession());
    const failure = new Error("nope");

    spies.captured.session?.onError?.(failure);

    expect(spies.errorToast).toHaveBeenCalledWith(failure, "privacy.privateSessionFailed");
  });
});

describe("useClearListeningHistory", () => {
  it("says how many plays went and refreshes everything that counted them", () => {
    renderHook(() => useClearListeningHistory());

    spies.captured.clear?.onSuccess?.({ cleared: 12 });

    expect(spies.toastSuccess).toHaveBeenCalledWith('mutations:privacy.historyCleared{"count":12}');
    expect(spies.invalidateAll).toHaveBeenCalledOnce();
  });

  it("reports a failure under its own message and refreshes nothing", () => {
    renderHook(() => useClearListeningHistory());
    const failure = new Error("nope");

    spies.captured.clear?.onError?.(failure);

    expect(spies.errorToast).toHaveBeenCalledWith(failure, "privacy.clearHistoryFailed");
    expect(spies.invalidateAll).not.toHaveBeenCalled();
  });
});

describe("useUpdateServerPrivacy", () => {
  it("refreshes the privacy overview every card reads the server settings from", () => {
    renderHook(() => useUpdateServerPrivacy());

    spies.captured.server?.onSuccess?.({});

    expect(spies.invalidateOverview).toHaveBeenCalled();
  });
});

describe("useSetPlaylistVisibility", () => {
  it("names the new visibility and refreshes the lists that show it, even after a failure", () => {
    renderHook(() => useSetPlaylistVisibility());

    spies.captured.visibility?.onSuccess?.({ id: "pl-1", visibility: "private" });
    spies.captured.visibility?.onSettled?.();

    expect(spies.toastSuccess).toHaveBeenCalledWith("mutations:playlists.visibility.private");
    expect(spies.invalidatePlaylists).toHaveBeenCalledOnce();
    expect(spies.invalidateCounts).toHaveBeenCalledOnce();
    expect(spies.invalidateRequests).toHaveBeenCalledOnce();
  });

  it("reports a failure under its own message", () => {
    renderHook(() => useSetPlaylistVisibility());
    const failure = new Error("nope");

    spies.captured.visibility?.onError?.(failure);

    expect(spies.errorToast).toHaveBeenCalledWith(failure, "playlists.visibilityFailed");
  });
});
