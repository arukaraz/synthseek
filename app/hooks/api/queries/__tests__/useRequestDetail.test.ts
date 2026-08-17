import { describe, expect, it, vi } from "vitest";

import { useRequestDetail } from "../useRequestDetail";

const useQuery = vi.fn();

vi.mock("@utils/trpc", () => ({
  trpc: { requests: { getDetail: { useQuery: (input: unknown, opts: unknown) => useQuery(input, opts) } } },
}));

describe("useRequestDetail", () => {
  it("refetches on every mount, so returning to a container never serves a pre-navigation snapshot", () => {
    useRequestDetail({ id: "alb_1", contentType: "album" });

    expect(useQuery).toHaveBeenCalledWith(
      { id: "alb_1", contentType: "album" },
      expect.objectContaining({ refetchOnMount: "always" })
    );
  });

  it("stays disabled until both the id and the content type are known", () => {
    useRequestDetail({ id: null, contentType: null });

    expect(useQuery).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({ enabled: false }));
  });

  it("enables once a container is selected", () => {
    useRequestDetail({ id: "pl_1", contentType: "playlist" });

    expect(useQuery).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({ enabled: true }));
  });
});
