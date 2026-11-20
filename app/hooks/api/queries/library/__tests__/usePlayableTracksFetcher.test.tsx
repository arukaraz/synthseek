import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

const FIVE_MINUTES_MS = 5 * 60 * 1000;

const served = vi.hoisted(() => ({ order: ["a", "b", "c"] }));

vi.mock("@utils/trpc", async () => {
  const { useQueryClient } = await import("@tanstack/react-query");
  return {
    trpc: {
      useUtils: () => {
        const client = useQueryClient();
        return {
          library: {
            getPlayableTracks: {
              fetch: (target: unknown, options?: { staleTime?: number }) =>
                client.fetchQuery({
                  queryKey: ["library.getPlayableTracks", target],
                  queryFn: async () => [...served.order],
                  ...options,
                }),
            },
          },
        };
      },
    },
  };
});

import { usePlayableTracksFetcher } from "../usePlayableTracksFetcher";

function wrapperWith(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe("usePlayableTracksFetcher", () => {
  it("asks the server again on every Play, so an order changed a moment ago is the order that plays", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { staleTime: FIVE_MINUTES_MS } } });
    const { result } = renderHook(() => usePlayableTracksFetcher(), { wrapper: wrapperWith(client) });
    const target = { kind: "playlist" as const, playlistId: "pl-1" };

    expect(await result.current(target)).toEqual(["a", "b", "c"]);

    served.order = ["c", "a", "b"];

    expect(await result.current(target)).toEqual(["c", "a", "b"]);
  });
});
