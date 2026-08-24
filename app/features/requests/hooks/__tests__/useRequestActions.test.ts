import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";

import {
  ContentType,
  type PublicUser,
  RequestStatus,
  type RequestWithTracks,
  Role,
  type TrackRequest,
} from "@api/__generated__/types";

import { useRequestActions } from "../useRequestActions";

function useRequestActionsFor(request: RequestWithTracks) {
  return useRequestActions(request, request.tracks);
}

const idleMutation = { mutate: vi.fn(), isPending: false };

vi.mock("@hooks/api", () => ({
  useRetryAlbum: () => idleMutation,
  useRetryPlaylist: () => idleMutation,
  useRetryPlexPlaylist: () => idleMutation,
  useDeleteAlbum: () => idleMutation,
  useDeletePlaylist: () => idleMutation,
  useCancelAlbum: () => idleMutation,
  useCancelPlaylist: () => idleMutation,
  usePauseAlbum: () => idleMutation,
  usePausePlaylist: () => idleMutation,
  useResumeAlbum: () => idleMutation,
  useResumePlaylist: () => idleMutation,
  usePrioritizeAlbum: () => idleMutation,
  usePrioritizePlaylist: () => idleMutation,
  useApproveTracks: () => idleMutation,
  useRejectTracks: () => idleMutation,
}));

vi.mock("@hooks/api/mutations/spotify/useSpotifyImport", () => ({
  useSpotifySyncPlaylistNow: () => idleMutation,
}));

vi.mock("@hooks/api/queries/portability/useExportCollection", () => ({
  useExportCollection: () => ({ exportCollection: vi.fn() }),
}));

let currentUser: PublicUser | null = null;

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ currentUser }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

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

function makePlaylist(overrides: Partial<RequestWithTracks> = {}): RequestWithTracks {
  return {
    id: "req-1",
    external_id: "ext-1",
    name: "My Playlist",
    artist: "Various",
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
    contentType: ContentType.enum.playlist,
    plex_playlist_id: "plex-123",
    requestedBy: owner,
    ...overrides,
  };
}

describe("useRequestActions canSyncPlex", () => {
  it("stays available for a resolved playlist that was already synced to Plex", () => {
    currentUser = owner;
    const request = makePlaylist({ status: RequestStatus.enum.complete, plex_playlist_id: "plex-123" });

    const { result } = renderHook(() => useRequestActionsFor(request));

    expect(result.current.canSyncPlex).toBe(true);
  });

  it("is available for a partially complete playlist already synced to Plex", () => {
    currentUser = owner;
    const request = makePlaylist({
      status: RequestStatus.enum.partially_complete,
      plex_playlist_id: "plex-123",
    });

    const { result } = renderHook(() => useRequestActionsFor(request));

    expect(result.current.canSyncPlex).toBe(true);
  });

  it("is unavailable while the playlist is still processing", () => {
    currentUser = owner;
    const request = makePlaylist({ status: RequestStatus.enum.downloading, plex_playlist_id: null });

    const { result } = renderHook(() => useRequestActionsFor(request));

    expect(result.current.canSyncPlex).toBe(false);
  });

  it("is unavailable for an album", () => {
    currentUser = owner;
    const request = makePlaylist({ contentType: ContentType.enum.album });

    const { result } = renderHook(() => useRequestActionsFor(request));

    expect(result.current.canSyncPlex).toBe(false);
  });
});

describe("useRequestActions pause and resume", () => {
  it("offers resume and not pause for a paused group", () => {
    currentUser = owner;
    const request = makePlaylist({ status: RequestStatus.enum.paused });

    const { result } = renderHook(() => useRequestActionsFor(request));

    expect(result.current.isPaused).toBe(true);
    expect(result.current.canResume).toBe(true);
    expect(result.current.canPause).toBe(false);
  });

  it("offers pause and not resume for an active group", () => {
    currentUser = owner;
    const request = makePlaylist({ status: RequestStatus.enum.downloading });

    const { result } = renderHook(() => useRequestActionsFor(request));

    expect(result.current.isPaused).toBe(false);
    expect(result.current.canPause).toBe(true);
    expect(result.current.canResume).toBe(false);
  });

  it("does not offer pause for a complete group", () => {
    currentUser = owner;
    const request = makePlaylist({ status: RequestStatus.enum.complete });

    const { result } = renderHook(() => useRequestActionsFor(request));

    expect(result.current.canPause).toBe(false);
    expect(result.current.canResume).toBe(false);
  });

  it("does not offer retry failed for a paused group", () => {
    currentUser = owner;
    const request = makePlaylist({ status: RequestStatus.enum.paused });

    const { result } = renderHook(() => useRequestActionsFor(request));

    expect(result.current.canRetry).toBe(false);
    expect(result.current.canResume).toBe(true);
  });

  it("hides pause and resume for a user who cannot manage the request", () => {
    currentUser = null;
    const request = makePlaylist({ status: RequestStatus.enum.paused });

    const { result } = renderHook(() => useRequestActionsFor(request));

    expect(result.current.canPause).toBe(false);
    expect(result.current.canResume).toBe(false);
  });
});

describe("useRequestActions canPrioritize", () => {
  it("is available when at least one track is queued with no priority", () => {
    currentUser = owner;
    const request = makePlaylist({
      status: RequestStatus.enum.downloading,
      tracks: [
        makeTrack({ id: "t1", status: RequestStatus.enum.complete, priority: 0 }),
        makeTrack({ id: "t2", status: RequestStatus.enum.queued, priority: 0 }),
      ],
    });

    const { result } = renderHook(() => useRequestActionsFor(request));

    expect(result.current.canPrioritize).toBe(true);
  });

  it("is unavailable when every queued track is already prioritized", () => {
    currentUser = owner;
    const request = makePlaylist({
      status: RequestStatus.enum.downloading,
      tracks: [makeTrack({ id: "t1", status: RequestStatus.enum.queued, priority: 1 })],
    });

    const { result } = renderHook(() => useRequestActionsFor(request));

    expect(result.current.canPrioritize).toBe(false);
  });

  it("is unavailable when no track is queued", () => {
    currentUser = owner;
    const request = makePlaylist({
      status: RequestStatus.enum.downloading,
      tracks: [makeTrack({ id: "t1", status: RequestStatus.enum.downloading, priority: 0 })],
    });

    const { result } = renderHook(() => useRequestActionsFor(request));

    expect(result.current.canPrioritize).toBe(false);
  });

  it("is unavailable for a user who cannot manage the request", () => {
    currentUser = null;
    const request = makePlaylist({
      status: RequestStatus.enum.downloading,
      tracks: [makeTrack({ id: "t1", status: RequestStatus.enum.queued, priority: 0 })],
    });

    const { result } = renderHook(() => useRequestActionsFor(request));

    expect(result.current.canPrioritize).toBe(false);
  });
});
