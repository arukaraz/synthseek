import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  useUpdateConnectionsEnrichment,
  useUpdateConnectionsJellyfin,
  useUpdateConnectionsNavidrome,
  useUpdateConnectionsSlskd,
} from "../useUpdateConnections";

interface MutationOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

const spies = vi.hoisted(() => ({
  toastSuccess: vi.fn(),
  errorToast: vi.fn(),
  invalidate: vi.fn(),
  captured: {} as Record<string, MutationOptions>,
}));

vi.mock("sonner", () => ({
  toast: { success: spies.toastSuccess, error: vi.fn(), info: vi.fn(), warning: vi.fn() },
}));

vi.mock("@modules/errors", () => ({ errorToast: spies.errorToast }));

function mutationFor(name: string) {
  return {
    useMutation: (options: MutationOptions) => {
      spies.captured[name] = options;
      return { mutateAsync: vi.fn(), isPending: false };
    },
  };
}

vi.mock("@utils/trpc", () => {
  const invalidation = { invalidate: spies.invalidate };
  return {
    trpc: {
      useUtils: () => ({
        settings: { get: invalidation, slskdStatus: invalidation, downloadSourcesAvailability: invalidation },
        playback: { sources: { accounts: invalidation } },
      }),
      settings: {
        updateConnectionsSlskd: mutationFor("slskd"),
        updateConnectionsNavidrome: mutationFor("navidrome"),
        updateConnectionsJellyfin: mutationFor("jellyfin"),
        updateConnectionsEnrichment: mutationFor("enrichment"),
      },
    },
  };
});

const hooks = [
  ["slskd", useUpdateConnectionsSlskd],
  ["navidrome", useUpdateConnectionsNavidrome],
  ["jellyfin", useUpdateConnectionsJellyfin],
  ["enrichment", useUpdateConnectionsEnrichment],
] as const;

beforeEach(() => {
  vi.clearAllMocks();
  spies.captured = {};
});

describe.each(hooks)("the %s connection save", (name, useHook) => {
  it("toasts on success and on failure by default", () => {
    renderHook(() => useHook());

    spies.captured[name]?.onSuccess?.();
    spies.captured[name]?.onError?.(new Error("no"));

    expect(spies.toastSuccess).toHaveBeenCalledTimes(1);
    expect(spies.errorToast).toHaveBeenCalledTimes(1);
  });

  it("stays quiet when silent, but still refreshes the settings", () => {
    renderHook(() => useHook({ silent: true }));

    spies.captured[name]?.onSuccess?.();
    spies.captured[name]?.onError?.(new Error("no"));

    expect(spies.toastSuccess).not.toHaveBeenCalled();
    expect(spies.errorToast).not.toHaveBeenCalled();
    expect(spies.invalidate).toHaveBeenCalled();
  });
});
