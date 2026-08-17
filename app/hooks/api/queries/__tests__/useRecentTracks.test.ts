import { describe, expect, it, vi } from "vitest";

import { useRecentTracks } from "../useRecentTracks";

const useQuery = vi.fn();

vi.mock("@utils/trpc", () => ({
  trpc: { requests: { getRecentTracks: { useQuery: (input: unknown, opts: unknown) => useQuery(input, opts) } } },
}));

describe("useRecentTracks", () => {
  it("refetches on every mount, because the app's QueryClient never refetches on mount by default", () => {
    useRecentTracks(15);

    expect(useQuery).toHaveBeenCalledWith({ limit: 15 }, expect.objectContaining({ refetchOnMount: "always" }));
  });
});
