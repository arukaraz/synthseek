import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useSetupPending } from "../useSetupPending";
import { useSetupProgress } from "../useSetupProgress";

interface QueryOptions {
  enabled?: boolean;
  staleTime?: number;
  refetchOnMount?: boolean | "always";
  refetchOnWindowFocus?: boolean;
}

const spies = vi.hoisted(() => ({ calls: [] as { name: string; options: QueryOptions }[] }));

vi.mock("@utils/trpc", () => ({
  trpc: {
    settings: {
      setup: {
        progress: {
          useQuery: (_input: undefined, options: QueryOptions) => {
            spies.calls.push({ name: "progress", options });
            return { data: undefined };
          },
        },
        pending: {
          useQuery: (_input: undefined, options: QueryOptions) => {
            spies.calls.push({ name: "pending", options });
            return { data: undefined };
          },
        },
      },
    },
  },
}));

beforeEach(() => {
  spies.calls.length = 0;
});

describe("useSetupProgress", () => {
  it("always re-reads on mount, because the answer is the server's and a stale one sends the visitor to the wrong question", () => {
    renderHook(() => useSetupProgress({ enabled: true }));

    expect(spies.calls[0]).toEqual({
      name: "progress",
      options: { enabled: true, staleTime: 0, refetchOnMount: "always" },
    });
  });

  it("does not ask without a session", () => {
    renderHook(() => useSetupProgress({ enabled: false }));

    expect(spies.calls[0]?.options.enabled).toBe(false);
  });
});

describe("useSetupPending", () => {
  it("re-reads on mount and when the window regains focus, so the card follows what Settings changed", () => {
    renderHook(() => useSetupPending({ enabled: true }));

    expect(spies.calls[0]).toEqual({
      name: "pending",
      options: { enabled: true, staleTime: 0, refetchOnMount: "always", refetchOnWindowFocus: true },
    });
  });

  it("does not ask for a member", () => {
    renderHook(() => useSetupPending({ enabled: false }));

    expect(spies.calls[0]?.options.enabled).toBe(false);
  });
});
