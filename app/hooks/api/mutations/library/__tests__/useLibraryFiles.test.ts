import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

interface MutationOptions {
  onSuccess?: (data: { outcome: string }) => void;
  onError?: (err: unknown) => void;
}

const spies = vi.hoisted(() => {
  const captured: Record<string, MutationOptions | undefined> = {};
  return {
    captured,
    invalidateStatus: vi.fn(),
    errorToast: vi.fn(),
    toastWarning: vi.fn(),
    toastInfo: vi.fn(),
    toastError: vi.fn(),
  };
});

vi.mock("sonner", () => ({
  toast: { warning: spies.toastWarning, info: spies.toastInfo, error: spies.toastError },
}));

vi.mock("@modules/errors", () => ({ errorToast: spies.errorToast }));

function procedure(name: string) {
  return {
    useMutation: (options: MutationOptions) => {
      spies.captured[name] = options;
      return { mutate: vi.fn(), isPending: false };
    },
  };
}

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({ library: { files: { status: { invalidate: spies.invalidateStatus } } } }),
    library: { files: { move: procedure("move"), delete: procedure("delete") } },
  },
}));

import { useDeleteLibraryFiles, useMoveLibraryFiles } from "../useLibraryFiles";

function optionsOf(name: string): MutationOptions {
  const options = spies.captured[name];
  if (options === undefined) throw new Error(`${name} was never wired`);
  return options;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe.each([
  ["move", useMoveLibraryFiles],
  ["delete", useDeleteLibraryFiles],
] as const)("the %s mutation", (name, useHook) => {
  it("starts following the job and raises no refusal when the server starts it", () => {
    renderHook(() => useHook());
    optionsOf(name).onSuccess?.({ outcome: "started" });

    expect(spies.invalidateStatus).toHaveBeenCalledTimes(1);
    expect(spies.toastWarning).not.toHaveBeenCalled();
    expect(spies.toastInfo).not.toHaveBeenCalled();
    expect(spies.toastError).not.toHaveBeenCalled();
  });

  it("warns that another library job is running when the server is busy", () => {
    renderHook(() => useHook());
    optionsOf(name).onSuccess?.({ outcome: "busy" });

    expect(spies.toastWarning).toHaveBeenCalledWith("Another library job is running. Try again when it finishes.");
    expect(spies.invalidateStatus).not.toHaveBeenCalled();
  });

  it("says there was nothing to do when no song had a file", () => {
    renderHook(() => useHook());
    optionsOf(name).onSuccess?.({ outcome: "nothing_to_do" });

    expect(spies.toastInfo).toHaveBeenCalledWith("Nothing to do: none of these songs has a file in the library.");
  });

  it("names a vanished or unavailable path", () => {
    renderHook(() => useHook());
    optionsOf(name).onSuccess?.({ outcome: "not_found" });
    optionsOf(name).onSuccess?.({ outcome: "target_unavailable" });

    expect(spies.toastError).toHaveBeenCalledWith("That library path no longer exists.");
    expect(spies.toastWarning).toHaveBeenCalledWith("That library path is not available right now.");
  });

  it("hands a transport failure to the shared error toast", () => {
    renderHook(() => useHook());
    const error = new Error("boom");
    optionsOf(name).onError?.(error);

    expect(spies.errorToast).toHaveBeenCalledWith(error);
  });
});
