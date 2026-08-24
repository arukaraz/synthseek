import {
  ContentType,
  type PublicUser,
  RequestStatus,
  type RequestWithTracks,
  Role,
  type TrackRequest,
} from "@api/__generated__/types";
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SortField, type SortConfig } from "../../types";
import { useFilteredRequests } from "../useFilteredRequests";

const ownerId = "user-1";

const owner: PublicUser = {
  id: ownerId,
  email: "owner@example.com",
  username: "owner",
  avatar_url: null,
  role: Role.enum.member,
  language: "en",
  plex_username: null,
  plexLinked: false,
  hasPassword: true,
  created_at: new Date(),
};

function makeRequest(overrides: Partial<RequestWithTracks> = {}): RequestWithTracks {
  return {
    id: "req-1",
    external_id: "ext-1",
    name: "A Request",
    artist: "An Artist",
    album_art: null,
    user_id: ownerId,
    release_date: "2024-01-01",
    total_tracks: 10,
    completed_tracks: 10,
    status: RequestStatus.enum.complete,
    genres: null,
    upc: null,
    delegated_to: null,
    source_provider: "deezer",
    source_id: null,
    auto_imported: false,
    created_at: new Date(),
    updated_at: new Date(),
    tracks: [],
    contentType: ContentType.enum.album,
    plex_playlist_id: null,
    duplicateCount: 0,
    requestedBy: owner,
    ...overrides,
  };
}

function makeTrack(overrides: Partial<TrackRequest> = {}): TrackRequest {
  return {
    id: "track-1",
    slskd_request_id: "slskd-1",
    external_id: "ext-track-1",
    user_id: ownerId,
    title: "A Song",
    artist: "An Artist",
    request_type: ContentType.enum.track,
    isrc: null,
    track_number: 1,
    disc_number: 1,
    duration_ms: 180000,
    status: RequestStatus.enum.queued,
    progress: 0,
    priority: 0,
    bitrate: 320,
    format: "mp3",
    format_matching: "flexible",
    bitrate_matching: "flexible",
    album_id: "album-1",
    error: null,
    explicit: false,
    source: "deezer",
    failure_reason: null,
    downloaded_file: null,
    retry_count: 0,
    next_retry_at: null,
    watch_enabled: true,
    source_peer: null,
    upgrade: false,
    created_at: new Date(),
    completed_at: null,
    updated_at: new Date(),
    ...overrides,
  };
}

const recentDesc: SortConfig = { field: SortField.RECENT, direction: "desc" };

describe("useFilteredRequests default recency sort", () => {
  it("orders by updated_at desc so a re-requested item bumps to the top", () => {
    const oldUpdate = makeRequest({
      id: "old-update",
      name: "Created Last But Stale",
      created_at: new Date("2024-03-01T00:00:00Z"),
      updated_at: new Date("2024-03-01T00:00:00Z"),
    });
    const bumped = makeRequest({
      id: "bumped",
      name: "Created First But Re-Requested",
      created_at: new Date("2024-01-01T00:00:00Z"),
      updated_at: new Date("2024-06-01T00:00:00Z"),
    });

    const { result } = renderHook(() => useFilteredRequests([oldUpdate, bumped], "all", recentDesc, "", undefined));

    expect(result.current.map((item) => item.id)).toEqual(["bumped", "old-update"]);
  });

  it("does not key recency on created_at", () => {
    const newerCreatedStaleUpdate = makeRequest({
      id: "newer-created",
      created_at: new Date("2024-12-01T00:00:00Z"),
      updated_at: new Date("2024-01-01T00:00:00Z"),
    });
    const olderCreatedFreshUpdate = makeRequest({
      id: "older-created",
      created_at: new Date("2024-01-01T00:00:00Z"),
      updated_at: new Date("2024-12-31T00:00:00Z"),
    });

    const { result } = renderHook(() =>
      useFilteredRequests([newerCreatedStaleUpdate, olderCreatedFreshUpdate], "all", recentDesc, "", undefined)
    );

    expect(result.current[0]?.id).toBe("older-created");
  });

  it("respects ascending direction on updated_at", () => {
    const first = makeRequest({ id: "first", updated_at: new Date("2024-01-01T00:00:00Z") });
    const second = makeRequest({ id: "second", updated_at: new Date("2024-06-01T00:00:00Z") });

    const ascending: SortConfig = { field: SortField.RECENT, direction: "asc" };
    const { result } = renderHook(() => useFilteredRequests([second, first], "all", ascending, "", undefined));

    expect(result.current.map((item) => item.id)).toEqual(["first", "second"]);
  });
});

describe("useFilteredRequests sort by field", () => {
  const artistDesc: SortConfig = { field: SortField.ARTIST, direction: "desc" };
  const artistAsc: SortConfig = { field: SortField.ARTIST, direction: "asc" };
  const albumAsc: SortConfig = { field: SortField.ALBUM, direction: "asc" };
  const playlistAsc: SortConfig = { field: SortField.PLAYLIST, direction: "asc" };

  it("orders by artist ascending", () => {
    const zed = makeRequest({ id: "zed", artist: "Zed" });
    const ada = makeRequest({ id: "ada", artist: "Ada" });

    const { result } = renderHook(() => useFilteredRequests([zed, ada], "all", artistAsc, "", undefined));

    expect(result.current.map((item) => item.id)).toEqual(["ada", "zed"]);
  });

  it("orders by artist descending", () => {
    const zed = makeRequest({ id: "zed", artist: "Zed" });
    const ada = makeRequest({ id: "ada", artist: "Ada" });

    const { result } = renderHook(() => useFilteredRequests([ada, zed], "all", artistDesc, "", undefined));

    expect(result.current.map((item) => item.id)).toEqual(["zed", "ada"]);
  });

  it("orders by name for the album field", () => {
    const beta = makeRequest({ id: "beta", name: "Beta" });
    const alpha = makeRequest({ id: "alpha", name: "Alpha" });

    const { result } = renderHook(() => useFilteredRequests([beta, alpha], "all", albumAsc, "", undefined));

    expect(result.current.map((item) => item.id)).toEqual(["alpha", "beta"]);
  });

  it("orders by name for the playlist field", () => {
    const second = makeRequest({ id: "second", name: "Second" });
    const first = makeRequest({ id: "first", name: "First" });

    const { result } = renderHook(() => useFilteredRequests([second, first], "all", playlistAsc, "", undefined));

    expect(result.current.map((item) => item.id)).toEqual(["first", "second"]);
  });
});

describe("useFilteredRequests search filter", () => {
  it("matches on the request name", () => {
    const match = makeRequest({ id: "match", name: "Midnight Drive", artist: "Nobody" });
    const other = makeRequest({ id: "other", name: "Sunrise", artist: "Nobody" });

    const { result } = renderHook(() => useFilteredRequests([match, other], "all", recentDesc, "midnight", undefined));

    expect(result.current.map((item) => item.id)).toEqual(["match"]);
  });

  it("matches on the artist name", () => {
    const match = makeRequest({ id: "match", name: "Untitled", artist: "Daft Punk" });
    const other = makeRequest({ id: "other", name: "Untitled", artist: "Air" });

    const { result } = renderHook(() => useFilteredRequests([match, other], "all", recentDesc, "daft", undefined));

    expect(result.current.map((item) => item.id)).toEqual(["match"]);
  });

  it("keeps a request whose id the server reported as a track-title match", () => {
    const match = makeRequest({ id: "match", name: "Album", artist: "Artist" });
    const other = makeRequest({ id: "other", name: "Album", artist: "Artist" });

    const { result } = renderHook(() => useFilteredRequests([match, other], "all", recentDesc, "hidden", ["match"]));

    expect(result.current.map((item) => item.id)).toEqual(["match"]);
  });

  it("drops every request when the query matches no name, artist or reported track title", () => {
    const first = makeRequest({ id: "first", name: "Album", artist: "Artist" });
    const second = makeRequest({ id: "second", name: "Album", artist: "Artist" });

    const { result } = renderHook(() => useFilteredRequests([first, second], "all", recentDesc, "hidden", []));

    expect(result.current).toEqual([]);
  });

  it("still matches on name and artist while the track-title lookup is in flight", () => {
    const byName = makeRequest({ id: "by-name", name: "Hidden Gem", artist: "Artist" });
    const other = makeRequest({ id: "other", name: "Album", artist: "Artist" });

    const { result } = renderHook(() => useFilteredRequests([byName, other], "all", recentDesc, "hidden", undefined));

    expect(result.current.map((item) => item.id)).toEqual(["by-name"]);
  });

  it("drops items that match neither name, artist, nor any track", () => {
    const item = makeRequest({
      id: "item",
      name: "Album",
      artist: "Artist",
      tracks: [makeTrack({ id: "t1", title: "Song" })],
    });

    const { result } = renderHook(() => useFilteredRequests([item], "all", recentDesc, "zzz-no-match", undefined));

    expect(result.current).toEqual([]);
  });

  it("ignores a whitespace-only query and keeps every item", () => {
    const a = makeRequest({ id: "a" });
    const b = makeRequest({ id: "b" });

    const { result } = renderHook(() => useFilteredRequests([a, b], "all", recentDesc, "   ", undefined));

    expect(result.current).toHaveLength(2);
  });
});
