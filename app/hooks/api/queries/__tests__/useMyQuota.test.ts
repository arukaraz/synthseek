import { describe, expect, it, vi } from "vitest";

import { useMyQuota } from "../useMyQuota";

const useQuery = vi.fn();

vi.mock("@utils/trpc", () => ({
  trpc: { requests: { myQuota: { useQuery: (input: unknown, opts: unknown) => useQuery(input, opts) } } },
}));

describe("useMyQuota", () => {
  it("refetches on every mount, because requests made elsewhere move the usage it shows", () => {
    useMyQuota();

    expect(useQuery).toHaveBeenCalledWith(undefined, expect.objectContaining({ refetchOnMount: "always" }));
  });
});
