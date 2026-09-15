import { QueryClient, QueryClientProvider, useMutation, useQuery } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import enErrors from "@locale/messages/en/errors.json";

import { ErrorBoundaryProvider, useErrorBoundary } from "../ErrorBoundaryProvider";
import type { ErrorMutationMeta } from "../types";

const toast = vi.hoisted(() => ({ error: vi.fn(), warning: vi.fn(), success: vi.fn() }));

vi.mock("sonner", () => ({ toast }));

function client(): QueryClient {
  return new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
}

function wrapperFor(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ErrorBoundaryProvider queryClient={queryClient}>{children}</ErrorBoundaryProvider>
      </QueryClientProvider>
    );
  };
}

let probes = 0;

function renderFailingQuery(meta: ErrorMutationMeta | undefined, error: unknown) {
  const queryClient = client();
  probes += 1;
  const queryKey = ["probe", probes];
  return renderHook(() => useQuery({ queryKey, queryFn: () => Promise.reject(error), meta }), {
    wrapper: wrapperFor(queryClient),
  });
}

function renderFailingMutation(meta: ErrorMutationMeta | undefined, error: unknown) {
  const queryClient = client();
  return renderHook(() => useMutation({ mutationFn: () => Promise.reject(error), meta }), {
    wrapper: wrapperFor(queryClient),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("catching a failing query", () => {
  it("raises the translated message for a query that asked to be watched", async () => {
    renderFailingQuery({ errorCategory: "spotify" }, new Error("Spotify is not configured"));

    await waitFor(() =>
      expect(toast.warning).toHaveBeenCalledWith(enErrors.SPOTIFY_NOT_CONFIGURED.title, expect.anything())
    );
  });

  it("stays quiet for a query that declared no category, which handles its own errors", async () => {
    const { result } = renderFailingQuery(undefined, new Error("Spotify is not configured"));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.warning).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("stays quiet for a query that asked to be silent", async () => {
    const { result } = renderFailingQuery(
      { errorCategory: "spotify", silent: true },
      new Error("Spotify is not configured")
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.warning).not.toHaveBeenCalled();
  });
});

describe("catching a failing mutation", () => {
  it("raises the translated message for a mutation that asked to be watched", async () => {
    const { result } = renderFailingMutation({ errorCategory: "spotify" }, new Error("Spotify is not configured"));

    result.current.mutate();

    await waitFor(() => expect(toast.warning).toHaveBeenCalled());
  });

  it("stays quiet for a mutation that asked to be silent", async () => {
    const { result } = renderFailingMutation(
      { errorCategory: "spotify", silent: true },
      new Error("Spotify is not configured")
    );

    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.warning).not.toHaveBeenCalled();
  });
});

describe("useErrorBoundary", () => {
  it("raises whatever the caller hands it", () => {
    const queryClient = client();
    const { result } = renderHook(() => useErrorBoundary(), { wrapper: wrapperFor(queryClient) });

    result.current.notify(new Error("something odd"));

    expect(toast.error).toHaveBeenCalledWith("something odd", undefined);
  });

  it("raises a failure named by its reason", () => {
    const queryClient = client();
    const { result } = renderHook(() => useErrorBoundary(), { wrapper: wrapperFor(queryClient) });

    result.current.notifyById("spotify", "not_configured");

    expect(toast.warning).toHaveBeenCalledWith(enErrors.SPOTIFY_NOT_CONFIGURED.title, expect.anything());
  });

  it("raises a success named by its reason", () => {
    const queryClient = client();
    const { result } = renderHook(() => useErrorBoundary(), { wrapper: wrapperFor(queryClient) });

    result.current.notifySuccess("spotify", "connected");

    expect(toast.success).toHaveBeenCalledWith(enErrors.SPOTIFY_CONNECTED.title, expect.anything());
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("falls back to the generic apology for a reason it cannot name", () => {
    const queryClient = client();
    const { result } = renderHook(() => useErrorBoundary(), { wrapper: wrapperFor(queryClient) });

    result.current.notifySuccess("spotify", "who_knows");

    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
  });

  it("refuses to be used outside the provider, rather than failing quietly later", () => {
    expect(() => renderHook(() => useErrorBoundary())).toThrow("useErrorBoundary must be used within");
  });
});
