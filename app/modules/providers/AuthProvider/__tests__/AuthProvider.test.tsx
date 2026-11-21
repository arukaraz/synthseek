import { beforeEach, describe, expect, it, vi } from "vitest";
import { TRPCClientError } from "@trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";

import { renderWithProviders, waitFor } from "@test/test-utils";

import { AuthProvider } from "../AuthProvider";

const invalidateMe = vi.hoisted(() => vi.fn());
const accountWatch = vi.hoisted(() => vi.fn());
interface MeAnswer {
  data: { id: string; role: string } | null | undefined;
  isLoading: boolean;
  isError: boolean;
}

const SIGNED_IN: MeAnswer = { data: { id: "u1", role: "member" }, isLoading: false, isError: false };
const me = vi.hoisted((): { answer: MeAnswer } => ({
  answer: { data: undefined, isLoading: true, isError: false },
}));

vi.mock("@hooks/api/queries/useAccountEndWatch", () => ({ useAccountEndWatch: accountWatch }));

vi.mock("@utils/trpc", () => ({
  trpc: {
    auth: { me: { useQuery: () => me.answer } },
    useUtils: () => ({ auth: { me: { invalidate: invalidateMe } } }),
  },
}));

beforeEach(() => {
  me.answer = SIGNED_IN;
  accountWatch.mockClear();
});

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

  it("watches for the end of the account that is signed in", () => {
    renderWithProviders(
      <AuthProvider>
        <span />
      </AuthProvider>
    );

    expect(accountWatch).toHaveBeenLastCalledWith("u1", true);
  });

  it("tells the watch a visitor who answered signed out, as settled", () => {
    me.answer = { data: null, isLoading: false, isError: false };
    renderWithProviders(
      <AuthProvider>
        <span />
      </AuthProvider>
    );

    expect(accountWatch).toHaveBeenLastCalledWith(null, true);
  });

  it("does not call who is signed in settled while it is loading or could not be read", () => {
    me.answer = { data: undefined, isLoading: true, isError: false };
    const loading = renderWithProviders(
      <AuthProvider>
        <span />
      </AuthProvider>
    );
    expect(accountWatch).toHaveBeenLastCalledWith(null, false);
    loading.unmount();

    me.answer = { data: undefined, isLoading: false, isError: true };
    renderWithProviders(
      <AuthProvider>
        <span />
      </AuthProvider>
    );
    expect(accountWatch).toHaveBeenLastCalledWith(null, false);
  });
});
