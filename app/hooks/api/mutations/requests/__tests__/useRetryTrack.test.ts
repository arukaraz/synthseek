import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useRetryTrack } from "../useRetryTrack";

interface MutationOptions {
  onSettled?: () => void;
}

interface CapturedOptions {
  options?: MutationOptions;
}

const spies = vi.hoisted(() => {
  const captured: CapturedOptions = {};
  return {
    captured,
    requestsInvalidate: vi.fn(),
    libraryTracksInvalidate: vi.fn(),
    libraryCountsInvalidate: vi.fn(),
    cancel: vi.fn(),
    getData: vi.fn(),
    setData: vi.fn(),
  };
});

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({
      requests: {
        getAll: {
          invalidate: spies.requestsInvalidate,
          cancel: spies.cancel,
          getData: spies.getData,
          setData: spies.setData,
        },
      },
      library: {
        getTracks: { invalidate: spies.libraryTracksInvalidate },
        getCounts: { invalidate: spies.libraryCountsInvalidate },
      },
    }),
    requests: {
      retryTrack: {
        useMutation: (options: MutationOptions) => {
          spies.captured.options = options;
          return { mutate: vi.fn(), isPending: false };
        },
      },
    },
  },
}));

vi.mock("@modules/errors", () => ({
  errorToast: vi.fn(),
}));

vi.mock("@locale", () => ({
  default: { t: (key: string) => key },
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn() },
}));

describe("useRetryTrack", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    spies.captured.options = undefined;
  });

  it("on settle invalidates the requests list and BOTH library queries so the library refreshes", () => {
    renderHook(() => useRetryTrack());

    spies.captured.options?.onSettled?.();

    expect(spies.requestsInvalidate).toHaveBeenCalledTimes(1);
    expect(spies.libraryTracksInvalidate).toHaveBeenCalledTimes(1);
    expect(spies.libraryCountsInvalidate).toHaveBeenCalledTimes(1);
  });
});
