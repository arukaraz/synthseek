import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useFinishWizard } from "../useFinishWizard";

interface MutationOptions {
  onSuccess?: () => void;
  onError?: (error: { message?: string }) => void;
}

interface CapturedOptions {
  options?: MutationOptions;
}

const spies = vi.hoisted(() => {
  const captured: CapturedOptions = {};
  return {
    setData: vi.fn(),
    invalidate: vi.fn(),
    errorToast: vi.fn(),
    captured,
  };
});

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({
      auth: { setupRequired: { setData: spies.setData, invalidate: spies.invalidate } },
    }),
    settings: {
      finishWizard: {
        useMutation: (options: MutationOptions) => {
          spies.captured.options = options;
          return { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false };
        },
      },
    },
  },
}));

vi.mock("@modules/errors", () => ({ errorToast: spies.errorToast }));

describe("useFinishWizard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    spies.captured.options = undefined;
  });

  it("marks setup as no longer required, with no token needed, once the wizard is finished", () => {
    renderHook(() => useFinishWizard());

    spies.captured.options?.onSuccess?.();

    expect(spies.setData).toHaveBeenCalledWith(undefined, { required: false, tokenRequired: false });
    expect(spies.invalidate).toHaveBeenCalledTimes(1);
  });

  it("tells the administrator when finishing failed", () => {
    renderHook(() => useFinishWizard());
    const error = { message: "nope" };

    spies.captured.options?.onError?.(error);

    expect(spies.errorToast).toHaveBeenCalledWith(error, "settings.finishWizardFailed");
    expect(spies.setData).not.toHaveBeenCalled();
  });

  it("stays silent on failure when the caller shows the error itself", () => {
    renderHook(() => useFinishWizard({ silent: true }));

    spies.captured.options?.onError?.({ message: "nope" });

    expect(spies.errorToast).not.toHaveBeenCalled();
  });
});
