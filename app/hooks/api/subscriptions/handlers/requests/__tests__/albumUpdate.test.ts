import { QueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  ContentType,
  RequestStatus,
  SubscriptionEventType,
  type AlbumUpdatePayload,
  type RequestListItem,
} from "@api/__generated__/types";
import { makeRequestListItem } from "@features/requests/__tests__/factories";
import { trpc } from "@utils/trpc";
import type { RequestListCache } from "../../../../queries/requests/types";
import { resetThrottledInvalidations } from "../../../shared/throttledInvalidation";
import { handleAlbumUpdate } from "../albumUpdate";

const spies = vi.hoisted(() => ({
  invalidate: vi.fn(),
  invalidateSummary: vi.fn(),
}));

const utils = {
  requests: {
    list: { invalidate: spies.invalidate },
    summary: { invalidate: spies.invalidateSummary },
    getRecentTracks: { invalidate: vi.fn() },
    getDetail: { invalidate: vi.fn() },
  },
} as unknown as Parameters<typeof handleAlbumUpdate>[1];

const LIST_KEY = getQueryKey(trpc.requests.list, {}, "infinite");

function seed(queryClient: QueryClient, items: RequestListItem[]): void {
  const cache: RequestListCache = {
    pages: [{ items, total: items.length, next: null, previous: null }],
    pageParams: [null],
  };
  queryClient.setQueryData(LIST_KEY, cache);
}

function readItems(queryClient: QueryClient): RequestListItem[] {
  return queryClient.getQueryData<RequestListCache>(LIST_KEY)?.pages.flatMap((page) => page.items) ?? [];
}

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

  let queryClient: QueryClient;

  beforeEach(() => {
    resetThrottledInvalidations();
    spies.invalidate.mockReset();
    spies.invalidateSummary.mockReset();
    queryClient = new QueryClient();
  });

  it("refetches the list for an album it does not hold yet", () => {
    seed(queryClient, []);

    handleAlbumUpdate(albumEvent(RequestStatus.enum.queued, 0), utils, queryClient);

    expect(spies.invalidate).toHaveBeenCalledTimes(1);
    expect(spies.invalidateSummary).toHaveBeenCalledTimes(1);
    expect(readItems(queryClient)).toEqual([]);
  });

  it("patches a known album whose status held without refetching the list", () => {
    seed(queryClient, [cached]);

    handleAlbumUpdate(albumEvent(RequestStatus.enum.in_progress, 4), utils, queryClient);

    expect(spies.invalidate).not.toHaveBeenCalled();
    expect(readItems(queryClient)[0].completed_tracks).toBe(4);
  });

  it("refetches the list when a known album's status moved, so its track counts follow", () => {
    seed(queryClient, [cached]);

    handleAlbumUpdate(albumEvent(RequestStatus.enum.partially_complete, 9), utils, queryClient);

    expect(spies.invalidate).toHaveBeenCalledTimes(1);
    expect(readItems(queryClient)[0].status).toBe(RequestStatus.enum.partially_complete);
  });
});
