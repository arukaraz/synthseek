import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";

import { ContentType, type PublicUser, RequestStatus, type RequestWithTracks, Role } from "@api/__generated__/types";

import { useRequestActions } from "../useRequestActions";

const idleMutation = { mutate: vi.fn(), isPending: false };

vi.mock("@hooks/api", () => ({
  useRetryAlbum: () => idleMutation,
  useRetryPlaylist: () => idleMutation,
  useRetryPlexPlaylist: () => idleMutation,
  useDeleteAlbum: () => idleMutation,
  useDeletePlaylist: () => idleMutation,
  useCancelAlbum: () => idleMutation,
  useCancelPlaylist: () => idleMutation,
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

    const { result } = renderHook(() => useRequestActions(request));

    expect(result.current.canSyncPlex).toBe(true);
  });

  it("is available for a partially complete playlist already synced to Plex", () => {
    currentUser = owner;
    const request = makePlaylist({
      status: RequestStatus.enum.partially_complete,
      plex_playlist_id: "plex-123",
    });

    const { result } = renderHook(() => useRequestActions(request));

    expect(result.current.canSyncPlex).toBe(true);
  });

  it("is unavailable while the playlist is still processing", () => {
    currentUser = owner;
    const request = makePlaylist({ status: RequestStatus.enum.downloading, plex_playlist_id: null });

    const { result } = renderHook(() => useRequestActions(request));

    expect(result.current.canSyncPlex).toBe(false);
  });

  it("is unavailable for an album", () => {
    currentUser = owner;
    const request = makePlaylist({ contentType: ContentType.enum.album });

    const { result } = renderHook(() => useRequestActions(request));

    expect(result.current.canSyncPlex).toBe(false);
  });
});
