import { describe, it, expect, vi, beforeEach } from "vitest";

import { renderHook } from "@test/test-utils";

const mutateMock = vi.hoisted(() => vi.fn());
const upgradeMutateMock = vi.hoisted(() => vi.fn());
const notifyBulkUpgradeLimitMock = vi.hoisted(() => vi.fn());
const useRetryTracksMock = vi.hoisted(() => vi.fn());
const useUpgradeTracksMock = vi.hoisted(() => vi.fn());

const MAX_BULK_UPGRADE_TRACKS = vi.hoisted(() => 500);

vi.mock("@hooks/api", () => ({
  MAX_BULK_UPGRADE_TRACKS,
  useRetryTracks: useRetryTracksMock,
  useUpgradeTracks: useUpgradeTracksMock,
}));

vi.mock("@utils/request-helpers", () => ({
  notifyBulkUpgradeLimit: notifyBulkUpgradeLimitMock,
}));

import { useLibraryTrackActions } from "../useLibraryTrackActions";

describe("useLibraryTrackActions", () => {
  beforeEach(() => {
    mutateMock.mockReset();
    upgradeMutateMock.mockReset();
    notifyBulkUpgradeLimitMock.mockReset();
    useRetryTracksMock.mockReset();
    useUpgradeTracksMock.mockReset();
    useRetryTracksMock.mockReturnValue({ mutate: mutateMock, isPending: false });
    useUpgradeTracksMock.mockReturnValue({ mutate: upgradeMutateMock, isPending: false });
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

  it("forwards the track ids to the upgrade mutation", () => {
    const { result } = renderHook(() => useLibraryTrackActions());

    result.current.searchBetterQuality(["a", "b"]);

    expect(upgradeMutateMock).toHaveBeenCalledWith({ trackIds: ["a", "b"] });
    expect(notifyBulkUpgradeLimitMock).not.toHaveBeenCalled();
  });

  it("does not fire the upgrade mutation for an empty id list", () => {
    const { result } = renderHook(() => useLibraryTrackActions());

    result.current.searchBetterQuality([]);

    expect(upgradeMutateMock).not.toHaveBeenCalled();
  });

  it("submits a selection sitting exactly on the server cap", () => {
    const ids = Array.from({ length: MAX_BULK_UPGRADE_TRACKS }, (_, index) => `trk-${index}`);
    const { result } = renderHook(() => useLibraryTrackActions());

    result.current.searchBetterQuality(ids);

    expect(upgradeMutateMock).toHaveBeenCalledWith({ trackIds: ids });
  });

  it("refuses a selection over the server cap instead of truncating it", () => {
    const ids = Array.from({ length: MAX_BULK_UPGRADE_TRACKS + 1 }, (_, index) => `trk-${index}`);
    const { result } = renderHook(() => useLibraryTrackActions());

    result.current.searchBetterQuality(ids);

    expect(upgradeMutateMock).not.toHaveBeenCalled();
    expect(notifyBulkUpgradeLimitMock).toHaveBeenCalledWith(MAX_BULK_UPGRADE_TRACKS);
  });

  it("exposes the upgrade pending state as isUpgrading", () => {
    useUpgradeTracksMock.mockReturnValue({ mutate: upgradeMutateMock, isPending: true });

    const { result } = renderHook(() => useLibraryTrackActions());

    expect(result.current.isUpgrading).toBe(true);
  });
});
