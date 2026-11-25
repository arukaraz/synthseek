import { describe, it, expect, vi, beforeEach } from "vitest";

import { QueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";

import {
  ContentType,
  RequestStatus,
  SubscriptionEventType,
  type PlaylistUpdatePayload,
  type RequestListItem,
} from "@api/__generated__/types";
import { makeRequestListItem } from "@features/requests/__tests__/factories";
import { trpc } from "@utils/trpc";
import {
  buildDockItems,
  correlateDockJob,
  resetDockStore,
  seedDockJob,
  useDockJobs,
} from "../../../shared/progressDock";
import { renderHook } from "@testing-library/react";
import type { RequestListCache } from "../../../../queries/requests/types";
import { handlePlaylistUpdate } from "../playlistUpdate";
import { resetThrottledInvalidations } from "../../../shared/throttledInvalidation";

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
} as unknown as Parameters<typeof handlePlaylistUpdate>[1];

const LIST_KEY = getQueryKey(trpc.requests.list, {}, "infinite");

let queryClient: QueryClient;

function seed(items: RequestListItem[]): void {
  const cache: RequestListCache = {
    pages: [{ items, total: items.length, next: null, previous: null }],
    pageParams: [null],
  };
  queryClient.setQueryData(LIST_KEY, cache);
}

function readItems(): RequestListItem[] {
  return queryClient.getQueryData<RequestListCache>(LIST_KEY)?.pages.flatMap((page) => page.items) ?? [];
}

function makePlaylist(overrides: Partial<RequestListItem>): RequestListItem {
  return makeRequestListItem({
    id: "pl_existing",
    name: "Existing Playlist",
    contentType: ContentType.enum.playlist,
    status: RequestStatus.enum.in_progress,
    total_tracks: 10,
    completed_tracks: 3,
    ...overrides,
  });
}

function makeInitialEvent(playlistId: string, totalTracks: number): PlaylistUpdatePayload {
  return {
    eventType: SubscriptionEventType.PlaylistUpdate,
    playlistId,
    status: RequestStatus.enum.queued,
    completedTracks: 0,
    totalTracks,
  };
}

describe("handlePlaylistUpdate", () => {
  beforeEach(() => {
    resetThrottledInvalidations();
    spies.invalidate.mockReset();
    spies.invalidateSummary.mockReset();
    queryClient = new QueryClient();
  });

  it("invalidates the requests list when a freshly imported playlist is not yet in cache", () => {
    seed([makePlaylist({ id: "pl_existing" })]);

    handlePlaylistUpdate(makeInitialEvent("pl_new", 200), utils, queryClient);

    expect(spies.invalidate).toHaveBeenCalledTimes(1);
    expect(spies.invalidateSummary).toHaveBeenCalledTimes(1);
    expect(readItems().map((item) => item.id)).toEqual(["pl_existing"]);
    expect(readItems()[0].total_tracks).toBe(10);
  });

  it("invalidates when the cache is empty (initial event before any list load)", () => {
    handlePlaylistUpdate(makeInitialEvent("pl_new", 200), utils, queryClient);

    expect(spies.invalidate).toHaveBeenCalledTimes(1);
    expect(readItems()).toEqual([]);
  });

  it("does not invalidate a known playlist whose status held; patches its progress in place", () => {
    seed([makePlaylist({ id: "pl_existing", completed_tracks: 3, total_tracks: 10 })]);

    handlePlaylistUpdate(
      {
        eventType: SubscriptionEventType.PlaylistUpdate,
        playlistId: "pl_existing",
        status: RequestStatus.enum.in_progress,
        completedTracks: 4,
        totalTracks: 10,
      },
      utils,
      queryClient
    );

    expect(spies.invalidate).not.toHaveBeenCalled();
    expect(readItems()[0].completed_tracks).toBe(4);
  });

  it("refetches the list when a known playlist's status moved, so its track counts follow", () => {
    seed([makePlaylist({ id: "pl_existing", completed_tracks: 3, total_tracks: 10 })]);

    const event: PlaylistUpdatePayload = {
      eventType: SubscriptionEventType.PlaylistUpdate,
      playlistId: "pl_existing",
      status: RequestStatus.enum.complete,
      completedTracks: 10,
      totalTracks: 10,
    };

    handlePlaylistUpdate(event, utils, queryClient);

    expect(spies.invalidate).toHaveBeenCalledTimes(1);

    const next = readItems();
    expect(next[0].status).toBe(RequestStatus.enum.complete);
    expect(next[0].completed_tracks).toBe(10);
    expect(next[0].total_tracks).toBe(10);
  });

  it("does not match an album that shares the playlist id", () => {
    const album = makePlaylist({ id: "shared_id", contentType: ContentType.enum.album });
    seed([album]);

    handlePlaylistUpdate(makeInitialEvent("shared_id", 5), utils, queryClient);

    expect(spies.invalidate).toHaveBeenCalledTimes(1);
    expect(readItems()[0]).toEqual(album);
  });

  describe("request dock finalization", () => {
    beforeEach(() => {
      resetDockStore();
    });

    function seedCorrelatedRequest(playlistId: string): void {
      seedDockJob({
        id: "req-dock",
        kind: "request",
        items: buildDockItems([{ key: "track-0", name: "Async Playlist" }]),
        status: "running",
      });
      correlateDockJob("req-dock", playlistId);
    }

    function readStatus(): string | undefined {
      const { result } = renderHook(() => useDockJobs());
      return result.current.find((job) => job.id === "req-dock")?.status;
    }

    function populateEvent(
      playlistId: string,
      populatePhase: NonNullable<PlaylistUpdatePayload["populatePhase"]>
    ): PlaylistUpdatePayload {
      return {
        eventType: SubscriptionEventType.PlaylistUpdate,
        playlistId,
        status: RequestStatus.enum.in_progress,
        completedTracks: 0,
        totalTracks: 1,
        populatePhase,
      };
    }

    function downloadTickEvent(playlistId: string, status: RequestStatus): PlaylistUpdatePayload {
      return {
        eventType: SubscriptionEventType.PlaylistUpdate,
        playlistId,
        status,
        completedTracks: 1,
        totalTracks: 1,
      };
    }

    it("finalizes the matching running request job to complete on populatePhase complete", () => {
      seedCorrelatedRequest("pl_async");
      handlePlaylistUpdate(populateEvent("pl_async", "complete"), utils, queryClient);
      expect(readStatus()).toBe("complete");
    });

    it("finalizes to partial on populatePhase partial", () => {
      seedCorrelatedRequest("pl_async");
      handlePlaylistUpdate(populateEvent("pl_async", "partial"), utils, queryClient);
      expect(readStatus()).toBe("partial");
    });

    it("finalizes to failed on populatePhase failed", () => {
      seedCorrelatedRequest("pl_async");
      handlePlaylistUpdate(populateEvent("pl_async", "failed"), utils, queryClient);
      expect(readStatus()).toBe("failed");
    });

    it("leaves the request job running for an event without populatePhase", () => {
      seedCorrelatedRequest("pl_async");
      handlePlaylistUpdate(downloadTickEvent("pl_async", RequestStatus.enum.in_progress), utils, queryClient);
      expect(readStatus()).toBe("running");
    });

    it("does not finalize the request dock off a terminal download status without populatePhase", () => {
      seedCorrelatedRequest("pl_async");
      handlePlaylistUpdate(downloadTickEvent("pl_async", RequestStatus.enum.complete), utils, queryClient);
      expect(readStatus()).toBe("running");
    });

    it("does not finalize a request job correlated to a different playlist id", () => {
      seedCorrelatedRequest("pl_other");
      handlePlaylistUpdate(populateEvent("pl_async", "complete"), utils, queryClient);
      expect(readStatus()).toBe("running");
    });

    it("settles a request job when the terminal populatePhase beats correlation (stash, then correlate applies it)", () => {
      seedDockJob({
        id: "req-dock",
        kind: "request",
        items: buildDockItems([{ key: "track-0", name: "Cached Playlist" }]),
        status: "running",
      });

      handlePlaylistUpdate(populateEvent("pl_fast", "complete"), utils, queryClient);
      expect(readStatus()).toBe("running");

      correlateDockJob("req-dock", "pl_fast");
      expect(readStatus()).toBe("complete");
    });
  });
});
