import { describe, expect, it, vi } from "vitest";
import { TRPCClientError } from "@trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";

import { renderWithProviders, waitFor } from "@test/test-utils";

import { AuthProvider } from "../AuthProvider";

const invalidateMe = vi.hoisted(() => vi.fn());

vi.mock("@utils/trpc", () => ({
  trpc: {
    auth: { me: { useQuery: () => ({ data: { id: "u1", role: "member" }, isLoading: false, isError: false }) } },
    useUtils: () => ({ auth: { me: { invalidate: invalidateMe } } }),
  },
}));

function RefusedHeartbeat() {
  const { mutate } = useMutation({
    mutationFn: async () => {
      const error = new TRPCClientError<never>("Authentication required");
      Object.defineProperty(error, "data", { value: { httpStatus: 401 }, configurable: true });
      throw error;
    },
  });
  useEffect(() => mutate(), [mutate]);
  return null;
}

describe("AuthProvider", () => {
  it("rechecks who is signed in once the server refuses a call for a dead session", async () => {
    renderWithProviders(
      <AuthProvider>
        <RefusedHeartbeat />
      </AuthProvider>
    );

    await waitFor(() => expect(invalidateMe).toHaveBeenCalled());
  });
});
