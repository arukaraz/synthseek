import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

interface WhatsNewCache {
  entry: { version: string } | null;
  pending: boolean;
}

interface MutationOptions {
  onMutate?: () => Promise<void>;
  onSuccess?: () => void;
}

type CacheUpdater = (value: WhatsNewCache | undefined) => WhatsNewCache | undefined;

const spies = vi.hoisted(() => {
  const options: { current?: MutationOptions } = {};
  return {
    options,
    cancel: vi.fn(async () => undefined),
    setData: vi.fn<(input: undefined, updater: CacheUpdater) => void>(),
    invalidate: vi.fn(),
  };
});

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({
      updates: { whatsNew: { cancel: spies.cancel, setData: spies.setData, invalidate: spies.invalidate } },
    }),
    updates: {
      dismissWhatsNew: {
        useMutation: (options: MutationOptions) => {
          spies.options.current = options;
          return { mutate: vi.fn() };
        },
      },
    },
  },
}));

import { useDismissWhatsNew } from "../useDismissWhatsNew";

function registered(): MutationOptions {
  const options = spies.options.current;
  if (options === undefined) throw new Error("dismissWhatsNew was never registered");
  return options;
}

function applyUpdater(previous: WhatsNewCache | undefined): WhatsNewCache | undefined {
  return spies.setData.mock.calls[0][1](previous);
}

beforeEach(() => {
  spies.options.current = undefined;
  vi.clearAllMocks();
});

describe("useDismissWhatsNew", () => {
  it("marks the announcement seen in the cache before the server answers", async () => {
    renderHook(() => useDismissWhatsNew());

    await registered().onMutate?.();

    expect(spies.cancel).toHaveBeenCalled();
    expect(applyUpdater({ entry: { version: "3.0.0" }, pending: true })).toEqual({
      entry: { version: "3.0.0" },
      pending: false,
    });
    expect(applyUpdater(undefined)).toBeUndefined();
  });

  it("refetches the announcement once the server sealed it", () => {
    renderHook(() => useDismissWhatsNew());

    registered().onSuccess?.();

    expect(spies.invalidate).toHaveBeenCalled();
  });
});
