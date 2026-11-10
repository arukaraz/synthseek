import { QueryClient, QueryClientProvider, skipToken, useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

type Input = { albumExternalId: string; format: "mp3" | "aac"; requestType: "album" };

const fetchPreview = vi.hoisted(() => vi.fn<(input: Input) => Promise<{ pathId: string }>>());

vi.mock("@utils/trpc", () => ({
  trpc: {
    library: {
      paths: {
        destination: {
          useQuery: (
            input: Input | typeof skipToken,
            options: Pick<UseQueryOptions<{ pathId: string }>, "staleTime" | "placeholderData">
          ) =>
            useQuery({
              queryKey: ["destination", input],
              queryFn: input === skipToken ? skipToken : () => fetchPreview(input),
              ...options,
            }),
        },
      },
    },
  },
}));

import { useLibraryDestination } from "../useLibraryDestination";

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const MP3: Input = { albumExternalId: "al1", format: "mp3", requestType: "album" };
const AAC: Input = { ...MP3, format: "aac" };

describe("useLibraryDestination", () => {
  it("asks nothing for no request", () => {
    const { result } = renderHook(() => useLibraryDestination(null), { wrapper });
    expect(result.current.data).toBeUndefined();
    expect(fetchPreview).not.toHaveBeenCalled();
  });

  it("keeps the last preview while the preview for a new format loads, so a picked path is not dropped", async () => {
    fetchPreview.mockResolvedValueOnce({ pathId: "soundtracks" });
    fetchPreview.mockReturnValueOnce(new Promise(() => {}));
    const { result, rerender } = renderHook(({ input }) => useLibraryDestination(input), {
      wrapper,
      initialProps: { input: MP3 },
    });
    await waitFor(() => expect(result.current.data).toEqual({ pathId: "soundtracks" }));

    rerender({ input: AAC });

    await waitFor(() => expect(fetchPreview).toHaveBeenLastCalledWith(AAC));
    expect(result.current.data).toEqual({ pathId: "soundtracks" });
  });
});
