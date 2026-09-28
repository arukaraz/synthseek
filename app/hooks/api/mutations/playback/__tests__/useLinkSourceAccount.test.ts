import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

interface MutationOptions {
  onSuccess?: (data: unknown) => void;
}

const spies = vi.hoisted(() => {
  const link: MutationOptions = {};
  const unlink: MutationOptions = {};
  return { link, unlink, setAccounts: vi.fn(), invalidateLibrarySources: vi.fn() };
});

vi.mock("@modules/errors", () => ({ errorToast: vi.fn() }));

vi.mock("@hooks/api/queries/library-source/useInvalidateLibrarySources", () => ({
  useInvalidateLibrarySources: () => spies.invalidateLibrarySources,
}));

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({ playback: { sources: { accounts: { setData: spies.setAccounts } } } }),
    playback: {
      sources: {
        link: {
          useMutation: (options: MutationOptions) => {
            spies.link.onSuccess = options.onSuccess;
            return {};
          },
        },
        unlink: {
          useMutation: (options: MutationOptions) => {
            spies.unlink.onSuccess = options.onSuccess;
            return {};
          },
        },
      },
    },
  },
}));

import { useLinkSourceAccount, useUnlinkSourceAccount } from "../useLinkSourceAccount";

const ACCOUNTS = [{ server: "navidrome", connected: true }];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("linking a member's server account", () => {
  it("refreshes the library sources, so Import offers the server without a reload", () => {
    renderHook(() => useLinkSourceAccount());

    spies.link.onSuccess?.({ outcome: "linked", accounts: ACCOUNTS });

    expect(spies.setAccounts).toHaveBeenCalledWith(undefined, ACCOUNTS);
    expect(spies.invalidateLibrarySources).toHaveBeenCalledTimes(1);
  });

  it("refreshes them on unlink too, so Import stops offering the server", () => {
    renderHook(() => useUnlinkSourceAccount());

    spies.unlink.onSuccess?.(ACCOUNTS);

    expect(spies.setAccounts).toHaveBeenCalledWith(undefined, ACCOUNTS);
    expect(spies.invalidateLibrarySources).toHaveBeenCalledTimes(1);
  });
});
