import {
  ContentType,
  type PublicUser,
  RequestStatus,
  type RequestWithTracks,
  Role,
  type TrackRequest,
} from "@api/__generated__/types";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useRecentRequests } from "../useRecentRequests";

const useTrackRequestsMock = vi.fn();

vi.mock("@hooks/api", () => ({
  useTrackRequests: () => useTrackRequestsMock(),
}));

const owner: PublicUser = {
  id: "user-1",
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

function makeTrack(id: string, createdAt: string, overrides: Partial<TrackRequest> = {}): TrackRequest {
  return {
    id,
    slskd_request_id: "slskd-1",
    external_id: `ext-${id}`,
    user_id: owner.id,
    title: id,
    artist: "An Artist",
    request_type: ContentType.enum.track,
    isrc: null,
    mbid: null,
    track_number: 1,
    disc_number: 1,
    duration_ms: 180000,
    status: RequestStatus.enum.complete,
    progress: 100,
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
    created_at: new Date(createdAt),
    completed_at: null,
    updated_at: new Date(createdAt),
    ...overrides,
  };
}

function makeRequest(id: string, tracks: TrackRequest[]): RequestWithTracks {
  return {
    id,
    external_id: `ext-${id}`,
    name: id,
    artist: "An Artist",
    album_art: null,
    user_id: owner.id,
    release_date: "2024-01-01",
    total_tracks: tracks.length,
    completed_tracks: tracks.length,
    status: RequestStatus.enum.complete,
    genres: null,
    upc: null,
    delegated_to: null,
    source_provider: "deezer",
    source_id: null,
    auto_imported: false,
    requested: false,
    created_at: new Date("2024-01-01T00:00:00Z"),
    updated_at: new Date("2024-01-01T00:00:00Z"),
    requested_at: new Date("2024-01-01T00:00:00Z"),
    tracks,
    contentType: ContentType.enum.playlist,
    plex_playlist_id: null,
    duplicateCount: 0,
    requestedBy: owner,
  };
}

beforeEach(() => {
  useTrackRequestsMock.mockReset();
});

describe("useRecentRequests", () => {
  it("dedupes a track that belongs to multiple parent requests, keeping the most recent occurrence", () => {
    const sharedOld = makeTrack("royals", "2024-01-01T00:00:00Z");
    const sharedNew = makeTrack("royals", "2024-06-01T00:00:00Z");
    const other = makeTrack("payphone", "2024-03-01T00:00:00Z");

    useTrackRequestsMock.mockReturnValue({
      data: [makeRequest("playlist-a", [sharedOld, other]), makeRequest("playlist-b", [sharedNew])],
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(() => useRecentRequests());

    const ids = result.current.recent.map((row) => row.id);
    expect(ids).toEqual(["royals", "payphone"]);
    expect(ids.filter((id) => id === "royals")).toHaveLength(1);
    expect(result.current.recent[0].created_at.toISOString()).toBe("2024-06-01T00:00:00.000Z");
  });

  it("orders distinct tracks by created_at desc", () => {
    useTrackRequestsMock.mockReturnValue({
      data: [
        makeRequest("playlist-a", [
          makeTrack("apologize", "2024-02-01T00:00:00Z"),
          makeTrack("the way you look at me", "2024-05-01T00:00:00Z"),
        ]),
      ],
      isLoading: false,
      isError: false,
    });

    const { result } = renderHook(() => useRecentRequests());

    expect(result.current.recent.map((row) => row.id)).toEqual(["the way you look at me", "apologize"]);
  });

  it("returns an empty list while data is undefined", () => {
    useTrackRequestsMock.mockReturnValue({ data: undefined, isLoading: true, isError: false });

    const { result } = renderHook(() => useRecentRequests());

    expect(result.current.recent).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });
});
