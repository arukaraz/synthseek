import { describe, it, expect, vi, beforeEach } from "vitest";

import { renderHook } from "@test/test-utils";

const mutateMock = vi.hoisted(() => vi.fn());
const useRetryTracksMock = vi.hoisted(() => vi.fn());

vi.mock("@hooks/api", () => ({
  useRetryTracks: useRetryTracksMock,
}));

import { useLibraryTrackActions } from "../useLibraryTrackActions";

describe("useLibraryTrackActions", () => {
  beforeEach(() => {
    mutateMock.mockReset();
    useRetryTracksMock.mockReset();
    useRetryTracksMock.mockReturnValue({ mutate: mutateMock, isPending: false });
  });

  it("forwards the track ids to the retry mutation", () => {
    const { result } = renderHook(() => useLibraryTrackActions());

    result.current.retryFailed(["a", "b"]);

    expect(mutateMock).toHaveBeenCalledTimes(1);
    expect(mutateMock).toHaveBeenCalledWith({ trackIds: ["a", "b"] });
  });

  it("does not fire the mutation for an empty id list", () => {
    const { result } = renderHook(() => useLibraryTrackActions());

    result.current.retryFailed([]);

    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("exposes the mutation pending state as isRetrying", () => {
    useRetryTracksMock.mockReturnValue({ mutate: mutateMock, isPending: true });

    const { result } = renderHook(() => useLibraryTrackActions());

    expect(result.current.isRetrying).toBe(true);
  });
});
