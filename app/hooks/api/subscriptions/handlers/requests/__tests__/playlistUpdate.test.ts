import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  ContentType,
  RequestStatus,
  SubscriptionEventType,
  type PlaylistUpdatePayload,
  type RequestWithTracks,
} from "@api/__generated__/types";
import { trpc } from "@utils/trpc";
import { handlePlaylistUpdate } from "../playlistUpdate";

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
});
