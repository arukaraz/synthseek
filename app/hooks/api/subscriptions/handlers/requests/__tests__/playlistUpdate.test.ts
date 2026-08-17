import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  ContentType,
  RequestStatus,
  SubscriptionEventType,
  type PlaylistUpdatePayload,
  type RequestWithTracks,
} from "@api/__generated__/types";
import { trpc } from "@utils/trpc";
import {
  buildDockItems,
  correlateDockJob,
  resetDockStore,
  seedDockJob,
  useDockJobs,
} from "../../../shared/progressDock";
import { renderHook } from "@testing-library/react";
import { handlePlaylistUpdate } from "../playlistUpdate";
import { resetRequestListInvalidation } from "../../../shared/requestListInvalidation";

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

function makePlaylist(overrides: Partial<RequestWithTracks>): RequestWithTracks {
  const now = new Date("2026-06-05T00:00:00.000Z");
  return {
    id: "pl_existing",
    external_id: "ext_existing",
    name: "Existing Playlist",
    artist: "Various",
    album_art: null,
    user_id: "u1",
    release_date: "",
    total_tracks: 10,
    completed_tracks: 3,
    status: RequestStatus.enum.in_progress,
    genres: null,
    upc: null,
    delegated_to: null,
    source_provider: null,
    source_id: null,
    auto_imported: false,
    created_at: now,
    updated_at: now,
    tracks: [],
    contentType: ContentType.enum.playlist,
    plex_playlist_id: null,
    requestedBy: {
      id: "u1",
      email: "u1@example.com",
      username: "u1",
      avatar_url: null,
      role: "member",
      language: "en",
      plex_username: null,
      plexLinked: false,
      hasPassword: true,
      created_at: now,
    },
    ...overrides,
  };
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
    resetRequestListInvalidation();
    spies.getData.mockReset();
    spies.setData.mockReset();
    spies.invalidate.mockReset();
  });

  it("invalidates the requests list when a freshly imported playlist is not yet in cache", () => {
    spies.getData.mockReturnValue([makePlaylist({ id: "pl_existing" })]);
    const utils = trpc.useUtils();

    handlePlaylistUpdate(makeInitialEvent("pl_new", 200), utils);

    expect(spies.invalidate).toHaveBeenCalledTimes(1);
    expect(spies.setData).not.toHaveBeenCalled();
  });

  it("invalidates when the cache is empty (initial event before any list load)", () => {
    spies.getData.mockReturnValue(undefined);
    const utils = trpc.useUtils();

    handlePlaylistUpdate(makeInitialEvent("pl_new", 200), utils);

    expect(spies.invalidate).toHaveBeenCalledTimes(1);
    expect(spies.setData).not.toHaveBeenCalled();
  });

  it("does not invalidate for a known playlist; patches status and progress in place", () => {
    const existing = makePlaylist({ id: "pl_existing", completed_tracks: 3, total_tracks: 10 });
    spies.getData.mockReturnValue([existing]);
    const utils = trpc.useUtils();

    const event: PlaylistUpdatePayload = {
      eventType: SubscriptionEventType.PlaylistUpdate,
      playlistId: "pl_existing",
      status: RequestStatus.enum.complete,
      completedTracks: 10,
      totalTracks: 10,
    };

    handlePlaylistUpdate(event, utils);

    expect(spies.invalidate).not.toHaveBeenCalled();
    expect(spies.setData).toHaveBeenCalledTimes(1);

    const updater = spies.setData.mock.calls[0][1];
    const next = updater([existing]);
    expect(next[0].status).toBe(RequestStatus.enum.complete);
    expect(next[0].completed_tracks).toBe(10);
    expect(next[0].total_tracks).toBe(10);
  });

  it("does not match an album that shares the playlist id", () => {
    const albumSameId = makePlaylist({ id: "shared_id" });
    const album: RequestWithTracks = { ...albumSameId, contentType: ContentType.enum.album };
    spies.getData.mockReturnValue([album]);
    const utils = trpc.useUtils();

    handlePlaylistUpdate(makeInitialEvent("shared_id", 5), utils);

    expect(spies.invalidate).toHaveBeenCalledTimes(1);
    expect(spies.setData).not.toHaveBeenCalled();
  });

  describe("request dock finalization", () => {
    beforeEach(() => {
      resetDockStore();
      spies.getData.mockReturnValue(undefined);
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
      handlePlaylistUpdate(populateEvent("pl_async", "complete"), trpc.useUtils());
      expect(readStatus()).toBe("complete");
    });

    it("finalizes to partial on populatePhase partial", () => {
      seedCorrelatedRequest("pl_async");
      handlePlaylistUpdate(populateEvent("pl_async", "partial"), trpc.useUtils());
      expect(readStatus()).toBe("partial");
    });

    it("finalizes to failed on populatePhase failed", () => {
      seedCorrelatedRequest("pl_async");
      handlePlaylistUpdate(populateEvent("pl_async", "failed"), trpc.useUtils());
      expect(readStatus()).toBe("failed");
    });

    it("leaves the request job running for an event without populatePhase", () => {
      seedCorrelatedRequest("pl_async");
      handlePlaylistUpdate(downloadTickEvent("pl_async", RequestStatus.enum.in_progress), trpc.useUtils());
      expect(readStatus()).toBe("running");
    });

    it("does not finalize the request dock off a terminal download status without populatePhase", () => {
      seedCorrelatedRequest("pl_async");
      handlePlaylistUpdate(downloadTickEvent("pl_async", RequestStatus.enum.complete), trpc.useUtils());
      expect(readStatus()).toBe("running");
    });

    it("does not finalize a request job correlated to a different playlist id", () => {
      seedCorrelatedRequest("pl_other");
      handlePlaylistUpdate(populateEvent("pl_async", "complete"), trpc.useUtils());
      expect(readStatus()).toBe("running");
    });

    it("settles a request job when the terminal populatePhase beats correlation (stash, then correlate applies it)", () => {
      seedDockJob({
        id: "req-dock",
        kind: "request",
        items: buildDockItems([{ key: "track-0", name: "Cached Playlist" }]),
        status: "running",
      });

      handlePlaylistUpdate(populateEvent("pl_fast", "complete"), trpc.useUtils());
      expect(readStatus()).toBe("running");

      correlateDockJob("req-dock", "pl_fast");
      expect(readStatus()).toBe("complete");
    });
  });
});
