import { beforeEach, describe, expect, it, vi } from "vitest";

import { ContentType, RequestStatus, SubscriptionEventType, type AlbumUpdatePayload } from "@api/__generated__/types";
import { makeRequestListItem } from "@features/requests/__tests__/factories";
import { trpc } from "@utils/trpc";
import { resetThrottledInvalidations } from "../../../shared/throttledInvalidation";
import { handleAlbumUpdate } from "../albumUpdate";

const spies = vi.hoisted(() => ({
  getData: vi.fn(),
  setData: vi.fn(),
  invalidate: vi.fn(),
}));

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({
      requests: {
        getAll: { getData: spies.getData, setData: spies.setData, invalidate: spies.invalidate },
        getRecentTracks: { invalidate: vi.fn() },
        getDetail: { invalidate: vi.fn() },
      },
    }),
  },
}));

function albumEvent(status: RequestStatus, completedTracks: number): AlbumUpdatePayload {
  return {
    eventType: SubscriptionEventType.AlbumUpdate,
    albumId: "alb_1",
    status,
    completedTracks,
    totalTracks: 10,
  };
}

describe("handleAlbumUpdate", () => {
  const cached = makeRequestListItem({
    id: "alb_1",
    contentType: ContentType.enum.album,
    status: RequestStatus.enum.in_progress,
    completed_tracks: 3,
    total_tracks: 10,
  });

  beforeEach(() => {
    resetThrottledInvalidations();
    spies.getData.mockReset();
    spies.setData.mockReset();
    spies.invalidate.mockReset();
  });

  it("refetches the list for an album it does not hold yet", () => {
    spies.getData.mockReturnValue([]);

    handleAlbumUpdate(albumEvent(RequestStatus.enum.queued, 0), trpc.useUtils());

    expect(spies.invalidate).toHaveBeenCalledTimes(1);
    expect(spies.setData).not.toHaveBeenCalled();
  });

  it("patches a known album whose status held without refetching the list", () => {
    spies.getData.mockReturnValue([cached]);

    handleAlbumUpdate(albumEvent(RequestStatus.enum.in_progress, 4), trpc.useUtils());

    expect(spies.invalidate).not.toHaveBeenCalled();
    expect(spies.setData.mock.calls[0][1]([cached])[0].completed_tracks).toBe(4);
  });

  it("refetches the list when a known album's status moved, so its track counts follow", () => {
    spies.getData.mockReturnValue([cached]);

    handleAlbumUpdate(albumEvent(RequestStatus.enum.partially_complete, 9), trpc.useUtils());

    expect(spies.invalidate).toHaveBeenCalledTimes(1);
    expect(spies.setData.mock.calls[0][1]([cached])[0].status).toBe(RequestStatus.enum.partially_complete);
  });
});
