import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { usePlexLoginFlow } from "../usePlexLoginFlow";

const spies = vi.hoisted(() => ({
  meSetData: vi.fn(),
  setupInvalidate: vi.fn(async () => undefined),
  complete: vi.fn(),
}));

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({
      auth: {
        me: { setData: spies.meSetData },
        setupRequired: { invalidate: spies.setupInvalidate },
      },
    }),
    auth: {
      plexStart: { useMutation: () => ({ mutateAsync: vi.fn() }) },
      plexComplete: { useMutation: () => ({ mutateAsync: spies.complete }) },
    },
  },
}));

const user = { id: "u1", username: "someone" };

describe("usePlexLoginFlow poll", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("keeps waiting while the sign-in is not authenticated yet", async () => {
    spies.complete.mockResolvedValue({ status: "pending", user: null });
    const { result } = renderHook(() => usePlexLoginFlow());

    await expect(result.current.poll("pin-1")).resolves.toBeNull();
    expect(spies.meSetData).not.toHaveBeenCalled();
  });

  it("stores the signed-in user and returns them", async () => {
    spies.complete.mockResolvedValue({ status: "authenticated", user });
    const { result } = renderHook(() => usePlexLoginFlow());

    await expect(result.current.poll("pin-1")).resolves.toBe(user);
    expect(spies.meSetData).toHaveBeenCalledWith(undefined, user);
  });

  it("refreshes the setup status before rethrowing when the server has no administrator yet", async () => {
    const refusal = { data: { appCode: "PLEX_SIGN_IN_NEEDS_SETUP" } };
    spies.complete.mockRejectedValue(refusal);
    const { result } = renderHook(() => usePlexLoginFlow());

    await expect(result.current.poll("pin-1")).rejects.toBe(refusal);
    expect(spies.setupInvalidate).toHaveBeenCalledTimes(1);
  });

  it("rethrows any other refusal without touching the setup status", async () => {
    const refusal = { data: { appCode: "PLEX_USER_NOT_LINKED" } };
    spies.complete.mockRejectedValue(refusal);
    const { result } = renderHook(() => usePlexLoginFlow());

    await expect(result.current.poll("pin-1")).rejects.toBe(refusal);
    expect(spies.setupInvalidate).not.toHaveBeenCalled();
  });
});
