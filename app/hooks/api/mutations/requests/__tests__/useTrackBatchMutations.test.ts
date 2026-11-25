import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { TrackBatchResult } from "@utils/request-helpers";

import { useCancelTracks } from "../useCancelTracks";
import { usePrioritizeTracks } from "../usePrioritizeTracks";

interface MutationOptions {
  onError?: (error: Error) => void;
  onSettled?: () => void;
  onSuccess?: (result: TrackBatchResult) => void;
}

const spies = vi.hoisted(() => ({
  captured: {} as Record<string, MutationOptions>,
  listInvalidate: vi.fn(),
  detailInvalidate: vi.fn(),
  notify: vi.fn(),
  errorToast: vi.fn(),
}));

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({
      requests: {
        list: { invalidate: spies.listInvalidate },
        summary: { invalidate: vi.fn() },
        getDetail: { invalidate: spies.detailInvalidate },
      },
    }),
    requests: {
      cancelTracks: {
        useMutation: (options: MutationOptions) => {
          spies.captured.cancel = options;
          return { mutate: vi.fn(), isPending: false };
        },
      },
      prioritizeTracks: {
        useMutation: (options: MutationOptions) => {
          spies.captured.prioritize = options;
          return { mutate: vi.fn(), isPending: false };
        },
      },
    },
  },
}));

vi.mock("@modules/errors", () => ({ errorToast: spies.errorToast }));

vi.mock("@utils/request-helpers", () => ({ notifyTrackBatch: spies.notify }));

const result: TrackBatchResult = { requested: 1, applied: 1, skipped: [] };

describe.each([
  { name: "useCancelTracks", hook: useCancelTracks, kind: "cancel", errorKey: "requests.cancelTracksFailed" },
  {
    name: "usePrioritizeTracks",
    hook: usePrioritizeTracks,
    kind: "prioritize",
    errorKey: "requests.prioritizeTracksFailed",
  },
])("$name", ({ hook, kind, errorKey }) => {
  beforeEach(() => {
    vi.clearAllMocks();
    spies.captured = {};
  });

  it("reports the batch outcome under its own kind", () => {
    renderHook(() => hook());

    spies.captured[kind]?.onSuccess?.(result);

    expect(spies.notify).toHaveBeenCalledWith(result, kind);
  });

  it("names its own failure", () => {
    renderHook(() => hook());
    const error = new Error("boom");

    spies.captured[kind]?.onError?.(error);

    expect(spies.errorToast).toHaveBeenCalledWith(error, errorKey);
  });

  it("refreshes the request list and the open detail once settled", () => {
    renderHook(() => hook());

    spies.captured[kind]?.onSettled?.();

    expect(spies.listInvalidate).toHaveBeenCalledOnce();
    expect(spies.detailInvalidate).toHaveBeenCalledOnce();
  });
});
