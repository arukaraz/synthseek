import { describe, expect, it, vi } from "vitest";

import { useUnidentifiedFiles } from "../useUnidentifiedFiles";

interface ListQueryOptions {
  refetchInterval: (query: { state: { data: { groups: { retrying: number }[] } } }) => number | false;
}

const useQuery = vi.fn<(input: unknown, opts: ListQueryOptions) => void>();

vi.mock("@utils/trpc", () => ({
  trpc: {
    library: {
      scan: {
        unidentified: { list: { useQuery: (input: unknown, opts: ListQueryOptions) => useQuery(input, opts) } },
      },
    },
  },
}));

const BACKGROUND_GATE_QUIET_WINDOW_MS = 5_000;

const intervalFrom = (retrying: number[]): number | false => {
  const call = useQuery.mock.calls.at(-1);
  if (call === undefined) throw new Error("the hook never queried");
  const [, options] = call;
  return options.refetchInterval({ state: { data: { groups: retrying.map((count) => ({ retrying: count })) } } });
};

const input = { tab: "review" as const, page: 1, pageSize: 10 };

describe("useUnidentifiedFiles", () => {
  it("does not poll while nothing is being searched again", () => {
    useUnidentifiedFiles(input, true);
    expect(intervalFrom([0, 0])).toBe(false);
  });

  it("polls while a group is being searched again, slower than the background gate's quiet window", () => {
    useUnidentifiedFiles(input, true);
    const interval = intervalFrom([0, 2]);
    expect(interval).not.toBe(false);
    expect(interval).toBeGreaterThan(BACKGROUND_GATE_QUIET_WINDOW_MS);
  });
});
