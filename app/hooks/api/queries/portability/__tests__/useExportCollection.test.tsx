import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

const FIVE_MINUTES_MS = 5 * 60 * 1000;

const served = vi.hoisted(() => ({ titles: ["One", "Two"] }));

vi.mock("@utils/trpc", async () => {
  const { useQueryClient } = await import("@tanstack/react-query");
  return {
    trpc: {
      useUtils: () => {
        const client = useQueryClient();
        return {
          portability: {
            exportCollection: {
              fetch: (args: unknown, options?: { staleTime?: number }) =>
                client.fetchQuery({
                  queryKey: ["portability.exportCollection", args],
                  queryFn: async () => ({ playlist: { track: [...served.titles] } }),
                  ...options,
                }),
            },
          },
        };
      },
    },
  };
});

import { useExportCollection } from "../useExportCollection";

function wrapperWith(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe("useExportCollection", () => {
  it("exports the playlist as it is now, not as it was at the previous export", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { staleTime: FIVE_MINUTES_MS } } });
    const { result } = renderHook(() => useExportCollection(), { wrapper: wrapperWith(client) });
    const args = { id: "pl-1", type: "playlist" as const };

    expect(await result.current.exportCollection(args)).toEqual({ playlist: { track: ["One", "Two"] } });

    served.titles = ["Two", "One"];

    expect(await result.current.exportCollection(args)).toEqual({ playlist: { track: ["Two", "One"] } });
  });
});
