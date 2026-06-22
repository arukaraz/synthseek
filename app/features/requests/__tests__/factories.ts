import {
  ContentType,
  RequestStatus,
  Role,
  type PublicUser,
  type RequestWithTracks,
  type TrackRequest,
} from "@api/__generated__/types";

export function makeRequestsUser(overrides: Partial<PublicUser> = {}): PublicUser {
  return {
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
    ...overrides,
  };
}

export function makeRequestsTrack(overrides: Partial<TrackRequest> = {}): TrackRequest {
  return {
    id: "track-1",
    slskd_request_id: "slskd-1",
    external_id: "ext-track-1",
    user_id: "user-1",
    title: "A Song",
    artist: "An Artist",
    request_type: ContentType.enum.track,
    isrc: null,
    mbid: null,
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
    created_at: new Date(),
    completed_at: null,
    updated_at: new Date(),
    ...overrides,
  };
}

export function makeRequestWithTracks(overrides: Partial<RequestWithTracks> = {}): RequestWithTracks {
  return {
    id: "req-1",
    external_id: "ext-req-1",
    name: "A Playlist",
    artist: "Various Artists",
    album_art: null,
    user_id: "user-1",
    release_date: "2026-01-01",
    requested_at: new Date(),
    total_tracks: 10,
    completed_tracks: 7,
    status: RequestStatus.enum.downloading,
    genres: null,
    upc: null,
    delegated_to: null,
    source_provider: null,
    source_id: null,
    auto_imported: false,
    created_at: new Date(),
    updated_at: new Date(),
    contentType: ContentType.enum.playlist,
    plex_playlist_id: null,
    duplicateCount: 0,
    tracks: [],
    requestedBy: makeRequestsUser(),
    ...overrides,
  };
}
