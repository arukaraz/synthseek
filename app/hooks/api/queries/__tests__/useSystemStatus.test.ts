import { beforeEach, describe, expect, it, vi } from "vitest";

import { useSystemStatus } from "../useSystemStatus";

const useQuery = vi.fn();

vi.mock("@utils/trpc", () => ({
  trpc: { maintenance: { systemStatus: { useQuery: (input: unknown, opts: unknown) => useQuery(input, opts) } } },
}));

beforeEach(() => {
  useQuery.mockClear();
});

describe("useSystemStatus", () => {
  it("never fires the admin-only query for a member", () => {
    useSystemStatus(false);

    expect(useQuery).toHaveBeenCalledWith(undefined, expect.objectContaining({ enabled: false }));
  });

  it("fires the query for an admin", () => {
    useSystemStatus(true);

    expect(useQuery).toHaveBeenCalledWith(undefined, expect.objectContaining({ enabled: true }));
  });

  it("refetches on every mount, so opening the status page shows the latest check rather than the cached one", () => {
    useSystemStatus(true);

    expect(useQuery).toHaveBeenCalledWith(undefined, expect.objectContaining({ refetchOnMount: "always" }));
  });
});
