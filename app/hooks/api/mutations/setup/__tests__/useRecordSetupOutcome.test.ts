import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useRecordSetupOutcome } from "../useRecordSetupOutcome";

interface MutationOptions {
  onSuccess?: (progress: unknown) => void;
}

const spies = vi.hoisted(() => ({ setData: vi.fn(), captured: {} as { options?: MutationOptions } }));

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({ settings: { setup: { progress: { setData: spies.setData } } } }),
    settings: {
      setup: {
        recordOutcome: {
          useMutation: (options: MutationOptions) => {
            spies.captured.options = options;
            return { mutateAsync: vi.fn(), isPending: false };
          },
        },
      },
    },
  },
}));

describe("useRecordSetupOutcome", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    spies.captured.options = undefined;
  });

  it("puts the server's new progress in the cache so the next question reads it without a round trip", () => {
    renderHook(() => useRecordSetupOutcome());
    const progress = { questions: [], resumeAt: "downloads", finished: false };

    spies.captured.options?.onSuccess?.(progress);

    expect(spies.setData).toHaveBeenCalledWith(undefined, progress);
  });

  it("does not toast: the question shows its own inline error", () => {
    renderHook(() => useRecordSetupOutcome());

    expect(spies.captured.options).not.toHaveProperty("onError");
  });
});
