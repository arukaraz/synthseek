import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderHookWithProviders } from "@test/test-utils";

import { useUpdateAccessibility } from "../useUpdateAccessibility";

interface CapturedOptions {
  onSuccess: (user: { id: string }) => void;
  onError: (error: Error) => void;
}

const captured = vi.hoisted(() => ({ options: null as CapturedOptions | null }));
const setData = vi.hoisted(() => vi.fn());
const errorToast = vi.hoisted(() => vi.fn());

vi.mock("@modules/errors", () => ({ errorToast }));
vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({ auth: { me: { setData } } }),
    auth: {
      updateProfile: {
        useMutation: (options: CapturedOptions) => {
          captured.options = options;
          return { mutate: vi.fn() };
        },
      },
    },
  },
}));

function options(): CapturedOptions {
  if (captured.options === null) throw new Error("mutation not configured");
  return captured.options;
}

beforeEach(() => {
  captured.options = null;
  setData.mockReset();
  errorToast.mockReset();
});

describe("useUpdateAccessibility", () => {
  it("stores the saved user as the signed-in account", () => {
    renderHookWithProviders(() => useUpdateAccessibility());

    options().onSuccess({ id: "user-1" });

    expect(setData).toHaveBeenCalledWith(undefined, { id: "user-1" });
  });

  it("reports a failed save through the profile error path", () => {
    renderHookWithProviders(() => useUpdateAccessibility());
    const failure = new Error("nope");

    options().onError(failure);

    expect(errorToast).toHaveBeenCalledWith(failure, "auth.updateProfileFailed");
  });
});
