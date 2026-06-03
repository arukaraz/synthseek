import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

import { useSetupBootstrap } from "../useSetupBootstrap";
import type { PublicUser } from "@api/__generated__/types";

interface MutationOptions {
  onSuccess?: (user: PublicUser) => void;
  onError?: (error: { message?: string }) => void;
}

interface CapturedOptions {
  options?: MutationOptions;
}

const spies = vi.hoisted(() => {
  const captured: CapturedOptions = {};
  return {
    meSetData: vi.fn(),
    setupRequiredSetData: vi.fn(),
    setupRequiredInvalidate: vi.fn(),
    toastError: vi.fn(),
    captured,
  };
});

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({
      auth: {
        me: { setData: spies.meSetData },
        setupRequired: { setData: spies.setupRequiredSetData, invalidate: spies.setupRequiredInvalidate },
      },
    }),
    auth: {
      setupBootstrap: {
        useMutation: (options: MutationOptions) => {
          spies.captured.options = options;
          return { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false };
        },
      },
    },
  },
}));

vi.mock("sonner", () => ({
  toast: { error: spies.toastError },
}));

const buildUser = (): PublicUser => ({
  id: "user_1",
  username: "admin",
  email: "admin@example.com",
  role: "admin",
  avatar_url: null,
  plex_username: null,
  created_at: new Date("2026-01-01T00:00:00.000Z"),
});

describe("useSetupBootstrap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    spies.captured.options = undefined;
  });

  it("on success sets auth.me and invalidates setupRequired without optimistically setting it false", () => {
    renderHook(() => useSetupBootstrap());
    const user = buildUser();

    spies.captured.options?.onSuccess?.(user);

    expect(spies.meSetData).toHaveBeenCalledWith(undefined, user);
    expect(spies.setupRequiredInvalidate).toHaveBeenCalledTimes(1);
    expect(spies.setupRequiredSetData).not.toHaveBeenCalled();
  });

  it("on error surfaces the error message via toast", () => {
    renderHook(() => useSetupBootstrap());

    spies.captured.options?.onError?.({ message: "Username taken" });

    expect(spies.toastError).toHaveBeenCalledWith("Username taken");
  });

  it("on error falls back to a default message when none is provided", () => {
    renderHook(() => useSetupBootstrap());

    spies.captured.options?.onError?.({ message: undefined });

    expect(spies.toastError).toHaveBeenCalledWith("Setup failed");
  });
});
