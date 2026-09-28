import { describe, expect, it, vi } from "vitest";

import { useLibrarySources } from "../useLibrarySources";

const useQuery = vi.fn();

vi.mock("@utils/trpc", () => ({
  trpc: {
    librarySource: { provider: { all: { useQuery: (input: unknown, opts: unknown) => useQuery(input, opts) } } },
  },
}));

describe("useLibrarySources", () => {
  it("refetches on every mount, so a server linked on another page shows as connected when Import opens", () => {
    useLibrarySources(false);

    expect(useQuery).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({ enabled: false, refetchOnMount: "always" })
    );
  });
});
