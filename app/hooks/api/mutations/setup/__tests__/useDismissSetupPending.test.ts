import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useDismissSetupPending } from "../useDismissSetupPending";

interface MutationOptions {
  onSuccess?: (pending: unknown) => void;
  onError?: (error: unknown) => void;
}

const spies = vi.hoisted(() => ({
  setData: vi.fn(),
  errorToast: vi.fn(),
  captured: {} as { options?: MutationOptions },
}));

vi.mock("@modules/errors", () => ({ errorToast: spies.errorToast }));

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({ settings: { setup: { pending: { setData: spies.setData } } } }),
    settings: {
      setup: {
        dismissPending: {
          useMutation: (options: MutationOptions) => {
            spies.captured.options = options;
            return { mutate: vi.fn(), isPending: false };
          },
        },
      },
    },
  },
}));

describe("useDismissSetupPending", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    spies.captured.options = undefined;
  });

  it("writes the server's answer to the pending cache so the card disappears at once", () => {
    renderHook(() => useDismissSetupPending());
    const pending = { items: ["mediaServer"], count: 1, dismissed: true };

    spies.captured.options?.onSuccess?.(pending);

    expect(spies.setData).toHaveBeenCalledWith(undefined, pending);
  });

  it("tells the admin when hiding failed and leaves the cache alone", () => {
    renderHook(() => useDismissSetupPending());
    const error = new Error("no");

    spies.captured.options?.onError?.(error);

    expect(spies.errorToast).toHaveBeenCalledWith(error, "settings.dismissSetupFailed");
    expect(spies.setData).not.toHaveBeenCalled();
  });
});
