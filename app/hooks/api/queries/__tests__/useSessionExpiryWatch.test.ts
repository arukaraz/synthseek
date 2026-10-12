import { describe, expect, it, vi, beforeEach } from "vitest";
import { TRPCClientError } from "@trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";

import { createTestQueryClient, createWrapper, renderHook, waitFor } from "@test/test-utils";

import { useSessionExpiryWatch } from "../useSessionExpiryWatch";

const invalidateMe = vi.hoisted(() => vi.fn());

vi.mock("@utils/trpc", () => ({
  trpc: { useUtils: () => ({ auth: { me: { invalidate: invalidateMe } } }) },
}));

function clientErrorWithStatus(httpStatus: number): TRPCClientError<never> {
  const error = new TRPCClientError<never>("boom");
  Object.defineProperty(error, "data", { value: { httpStatus }, configurable: true });
  return error;
}

function failingMutation(error: Error) {
  return () => {
    useSessionExpiryWatch();
    return useMutation({
      mutationFn: async () => {
        throw error;
      },
    });
  };
}

beforeEach(() => {
  invalidateMe.mockClear();
});

describe("useSessionExpiryWatch", () => {
  it("rechecks the session when a mutation is refused for missing authentication", async () => {
    const { result } = renderHook(failingMutation(clientErrorWithStatus(401)), { wrapper: createWrapper() });

    result.current.mutate();

    await waitFor(() => expect(invalidateMe).toHaveBeenCalledTimes(1));
  });

  it("rechecks the session when a query is refused for missing authentication", async () => {
    renderHook(
      () => {
        useSessionExpiryWatch();
        return useQuery({
          queryKey: ["protected"],
          queryFn: async () => {
            throw clientErrorWithStatus(401);
          },
        });
      },
      { wrapper: createWrapper({ queryClient: createTestQueryClient() }) }
    );

    await waitFor(() => expect(invalidateMe).toHaveBeenCalledTimes(1));
  });

  it("leaves the session alone for a refusal that is not about authentication", async () => {
    const { result } = renderHook(failingMutation(clientErrorWithStatus(403)), { wrapper: createWrapper() });

    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidateMe).not.toHaveBeenCalled();
  });
});
