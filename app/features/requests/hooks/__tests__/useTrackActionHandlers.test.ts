import { renderHook } from "@testing-library/react";
import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeRequestsTrack } from "../../__tests__/factories";
import { useTrackActionHandlers } from "../useTrackActionHandlers";

const m = vi.hoisted(() => ({
  retryTrack: vi.fn(),
  cancelTrack: vi.fn(),
  prioritizeTrack: vi.fn(),
  setWatch: vi.fn(),
  approveTracks: vi.fn(),
  rejectTracks: vi.fn(),
  upgradeTracks: vi.fn(),
  retryTracks: vi.fn(),
  cancelTracks: vi.fn(),
  prioritizeTracks: vi.fn(),
  confirm: vi.fn(),
  notifyBulkTrackLimit: vi.fn(),
}));

const mutation = vi.hoisted(() => (mutate: () => void) => () => ({ mutate, isPending: false }));

vi.mock("@hooks/api", () => ({
  MAX_BULK_TRACK_IDS: 2,
  useRetryTrack: mutation(m.retryTrack),
  useCancelTrack: mutation(m.cancelTrack),
  usePrioritizeTrack: mutation(m.prioritizeTrack),
  useSetWatch: mutation(m.setWatch),
  useApproveTracks: mutation(m.approveTracks),
  useRejectTracks: mutation(m.rejectTracks),
  useUpgradeTracks: mutation(m.upgradeTracks),
  useRetryTracks: mutation(m.retryTracks),
  useCancelTracks: mutation(m.cancelTracks),
  usePrioritizeTracks: mutation(m.prioritizeTracks),
}));

vi.mock("@utils/confirm", () => ({ confirm: (...args: unknown[]) => m.confirm(...args) }));

vi.mock("@utils/request-helpers", () => ({
  notifyBulkTrackLimit: (max: number) => m.notifyBulkTrackLimit(max),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const track = makeRequestsTrack({ id: "t1", title: "One" });
const others = [makeRequestsTrack({ id: "a" }), makeRequestsTrack({ id: "b" }), makeRequestsTrack({ id: "c" })];

function setup() {
  const onBulkSent = vi.fn();
  const { result } = renderHook(() => useTrackActionHandlers(onBulkSent));
  return { result, onBulkSent };
}

beforeEach(() => {
  vi.clearAllMocks();
  m.confirm.mockResolvedValue(true);
});

describe("useTrackActionHandlers one track", () => {
  it.each([
    ["retry", m.retryTrack, { trackId: "t1" }],
    ["reimport", m.retryTrack, { trackId: "t1" }],
    ["requeue", m.retryTrack, { trackId: "t1" }],
    ["prioritize", m.prioritizeTrack, { trackId: "t1" }],
    ["upgrade", m.upgradeTracks, { trackIds: ["t1"] }],
    ["approve", m.approveTracks, { trackIds: ["t1"] }],
    ["stopWatch", m.setWatch, { trackId: "t1", enabled: false }],
    ["resumeWatch", m.setWatch, { trackId: "t1", enabled: true }],
  ] as const)("sends %s to its mutation", (id, spy, input) => {
    const { result } = setup();

    act(() => result.current.runTrackAction(id, track));

    expect(spy).toHaveBeenCalledWith(input);
  });

  it("cancels a track only once the person confirms", async () => {
    const { result } = setup();

    await act(async () => result.current.runTrackAction("cancel", track));

    expect(m.confirm).toHaveBeenCalledOnce();
    expect(m.cancelTrack).toHaveBeenCalledWith({ trackId: "t1" });
  });

  it("keeps the track when the person declines the cancel", async () => {
    m.confirm.mockResolvedValue(false);
    const { result } = setup();

    await act(async () => result.current.runTrackAction("cancel", track));

    expect(m.cancelTrack).not.toHaveBeenCalled();
  });

  it("asks for a reason before rejecting, then rejects with it without clearing the selection", () => {
    const { result, onBulkSent } = setup();

    act(() => result.current.runTrackAction("reject", track));
    expect(result.current.rejectCount).toBe(1);
    expect(m.rejectTracks).not.toHaveBeenCalled();

    act(() => result.current.confirmReject("wrong album"));

    expect(m.rejectTracks).toHaveBeenCalledWith({ trackIds: ["t1"], reason: "wrong album" });
    expect(onBulkSent).not.toHaveBeenCalled();
  });

  it("drops the pending reject when the dialog closes", () => {
    const { result } = setup();

    act(() => result.current.runTrackAction("reject", track));
    act(() => result.current.closeReject());

    expect(result.current.rejectCount).toBe(0);
  });
});

describe("useTrackActionHandlers bulk", () => {
  it.each([
    ["retry", m.retryTracks],
    ["requeue", m.retryTracks],
    ["prioritize", m.prioritizeTracks],
    ["upgrade", m.upgradeTracks],
    ["approve", m.approveTracks],
  ] as const)("sends %s for the selected tracks and clears the selection", async (id, spy) => {
    const { result, onBulkSent } = setup();

    await act(async () => result.current.runBulkAction(id, others.slice(0, 2)));

    expect(spy).toHaveBeenCalledWith({ trackIds: ["a", "b"] });
    expect(onBulkSent).toHaveBeenCalledOnce();
  });

  it.each(["retry", "prioritize", "upgrade", "approve", "cancel", "reject"] as const)(
    "refuses %s over the bulk limit with a notice, sending nothing and keeping the selection",
    async (id) => {
      const { result, onBulkSent } = setup();

      await act(async () => result.current.runBulkAction(id, others));

      expect(m.notifyBulkTrackLimit).toHaveBeenCalledWith(2);
      expect(m.confirm).not.toHaveBeenCalled();
      expect(result.current.rejectCount).toBe(0);
      for (const spy of [m.retryTracks, m.prioritizeTracks, m.upgradeTracks, m.approveTracks, m.cancelTracks]) {
        expect(spy).not.toHaveBeenCalled();
      }
      expect(onBulkSent).not.toHaveBeenCalled();
    }
  );

  it("cancels the selection only once the person confirms", async () => {
    const { result, onBulkSent } = setup();

    await act(async () => result.current.runBulkAction("cancel", others.slice(0, 2)));

    expect(m.confirm).toHaveBeenCalledWith(expect.objectContaining({ title: "confirm.cancelTracksTitle" }));
    expect(m.cancelTracks).toHaveBeenCalledWith({ trackIds: ["a", "b"] });
    expect(onBulkSent).toHaveBeenCalledOnce();
  });

  it("keeps the selection when the person declines the bulk cancel", async () => {
    m.confirm.mockResolvedValue(false);
    const { result, onBulkSent } = setup();

    await act(async () => result.current.runBulkAction("cancel", others.slice(0, 2)));

    expect(m.confirm).toHaveBeenCalledOnce();
    expect(m.cancelTracks).not.toHaveBeenCalled();
    expect(onBulkSent).not.toHaveBeenCalled();
  });

  it("clears the selection only after a bulk reject is confirmed", async () => {
    const { result, onBulkSent } = setup();

    await act(async () => result.current.runBulkAction("reject", others.slice(0, 2)));
    expect(result.current.rejectCount).toBe(2);
    expect(onBulkSent).not.toHaveBeenCalled();

    act(() => result.current.confirmReject());

    expect(m.rejectTracks).toHaveBeenCalledWith({ trackIds: ["a", "b"], reason: undefined });
    expect(onBulkSent).toHaveBeenCalledOnce();
  });
});
