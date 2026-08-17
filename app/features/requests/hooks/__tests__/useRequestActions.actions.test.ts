import { ContentType, type PublicUser, RequestStatus, type RequestWithTracks, Role } from "@api/__generated__/types";
import { renderHook, waitFor } from "@testing-library/react";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";

import { useRequestActions } from "../useRequestActions";

function useRequestActionsFor(request: RequestWithTracks) {
  return useRequestActions(request, request.tracks);
}

const mutations = vi.hoisted(() => ({
  retryAlbum: vi.fn(),
  retryPlaylist: vi.fn(),
  retryPlex: vi.fn(),
  deleteAlbum: vi.fn(),
  deletePlaylist: vi.fn(),
  cancelAlbum: vi.fn(),
  cancelPlaylist: vi.fn(),
  pauseAlbum: vi.fn(),
  pausePlaylist: vi.fn(),
  resumeAlbum: vi.fn(),
  resumePlaylist: vi.fn(),
  prioritizeAlbum: vi.fn(),
  prioritizePlaylist: vi.fn(),
  syncSpotify: vi.fn(),
}));

const confirmMock = vi.hoisted(() => vi.fn());
const exportCollectionMock = vi.hoisted(() => vi.fn());
const downloadTextMock = vi.hoisted(() => vi.fn());

vi.mock("@hooks/api", () => ({
  useRetryAlbum: () => ({ mutate: mutations.retryAlbum, isPending: false }),
  useRetryPlaylist: () => ({ mutate: mutations.retryPlaylist, isPending: false }),
  useRetryPlexPlaylist: () => ({ mutate: mutations.retryPlex, isPending: false }),
  useDeleteAlbum: () => ({ mutate: mutations.deleteAlbum, isPending: false }),
  useDeletePlaylist: () => ({ mutate: mutations.deletePlaylist, isPending: false }),
  useCancelAlbum: () => ({ mutate: mutations.cancelAlbum, isPending: false }),
  useCancelPlaylist: () => ({ mutate: mutations.cancelPlaylist, isPending: false }),
  usePauseAlbum: () => ({ mutate: mutations.pauseAlbum, isPending: false }),
  usePausePlaylist: () => ({ mutate: mutations.pausePlaylist, isPending: false }),
  useResumeAlbum: () => ({ mutate: mutations.resumeAlbum, isPending: false }),
  useResumePlaylist: () => ({ mutate: mutations.resumePlaylist, isPending: false }),
  usePrioritizeAlbum: () => ({ mutate: mutations.prioritizeAlbum, isPending: false }),
  usePrioritizePlaylist: () => ({ mutate: mutations.prioritizePlaylist, isPending: false }),
  useApproveTracks: () => ({ mutate: vi.fn(), isPending: false }),
  useRejectTracks: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@hooks/api/mutations/spotify/useSpotifyImport", () => ({
  useSpotifySyncPlaylistNow: () => ({ mutate: mutations.syncSpotify, isPending: false }),
}));

vi.mock("@hooks/api/queries/portability/useExportCollection", () => ({
  useExportCollection: () => ({ exportCollection: exportCollectionMock }),
}));

vi.mock("@utils/confirm", () => ({
  confirm: (...args: unknown[]) => confirmMock(...args),
}));

vi.mock("@utils/download", () => ({
  downloadText: (...args: unknown[]) => downloadTextMock(...args),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
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

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ currentUser: owner }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

function makeRequest(overrides: Partial<RequestWithTracks> = {}): RequestWithTracks {
  return {
    id: "req-1",
    external_id: "ext-1",
    name: "My Playlist",
    artist: "Various",
    album_art: null,
    user_id: "user-1",
    release_date: "2024-01-01",
    total_tracks: 10,
    completed_tracks: 10,
    status: RequestStatus.enum.downloading,
    genres: null,
    upc: null,
    delegated_to: null,
    source_provider: "spotify",
    source_id: null,
    auto_imported: false,
    created_at: new Date(),
    updated_at: new Date(),
    tracks: [],
    contentType: ContentType.enum.playlist,
    plex_playlist_id: "plex-123",
    duplicateCount: 0,
    requestedBy: owner,
    ...overrides,
  };
}

describe("useRequestActions playlist actions", () => {
  beforeEach(() => {
    confirmMock.mockResolvedValue(true);
    exportCollectionMock.mockResolvedValue({ playlist: { title: "My Playlist" } });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("retries the playlist by id", () => {
    const { result } = renderHook(() => useRequestActionsFor(makeRequest()));

    act(() => result.current.retry());

    expect(mutations.retryPlaylist).toHaveBeenCalledWith({ playlistId: "req-1" });
    expect(mutations.retryAlbum).not.toHaveBeenCalled();
  });

  it("prioritizes the playlist by id", () => {
    const { result } = renderHook(() => useRequestActionsFor(makeRequest()));

    act(() => result.current.prioritize());

    expect(mutations.prioritizePlaylist).toHaveBeenCalledWith({ playlistId: "req-1" });
  });

  it("pauses and resumes the playlist by id", () => {
    const { result } = renderHook(() => useRequestActionsFor(makeRequest()));

    act(() => result.current.pause());
    act(() => result.current.resume());

    expect(mutations.pausePlaylist).toHaveBeenCalledWith({ playlistId: "req-1" });
    expect(mutations.resumePlaylist).toHaveBeenCalledWith({ playlistId: "req-1" });
  });

  it("syncs the playlist to Plex by id", () => {
    const { result } = renderHook(() => useRequestActionsFor(makeRequest()));

    act(() => result.current.syncPlex());

    expect(mutations.retryPlex).toHaveBeenCalledWith({ playlistId: "req-1" });
  });

  it("syncs the playlist from its source by id", () => {
    const { result } = renderHook(() => useRequestActionsFor(makeRequest()));

    act(() => result.current.syncSourceNow());

    expect(mutations.syncSpotify).toHaveBeenCalledWith({ playlistId: "req-1" });
  });

  it("removes the playlist after the user confirms", async () => {
    const { result } = renderHook(() => useRequestActionsFor(makeRequest()));

    await act(async () => {
      await result.current.remove();
    });

    expect(confirmMock).toHaveBeenCalledOnce();
    expect(mutations.deletePlaylist).toHaveBeenCalledWith({ playlistId: "req-1" });
  });

  it("does not remove the playlist when the user declines", async () => {
    confirmMock.mockResolvedValue(false);
    const { result } = renderHook(() => useRequestActionsFor(makeRequest()));

    await act(async () => {
      await result.current.remove();
    });

    expect(mutations.deletePlaylist).not.toHaveBeenCalled();
  });

  it("cancels the playlist downloads after the user confirms", async () => {
    const { result } = renderHook(() => useRequestActionsFor(makeRequest()));

    await act(async () => {
      await result.current.cancel();
    });

    expect(mutations.cancelPlaylist).toHaveBeenCalledWith({ playlistId: "req-1" });
  });

  it("does not cancel the playlist downloads when the user declines", async () => {
    confirmMock.mockResolvedValue(false);
    const { result } = renderHook(() => useRequestActionsFor(makeRequest()));

    await act(async () => {
      await result.current.cancel();
    });

    expect(mutations.cancelPlaylist).not.toHaveBeenCalled();
  });

  it("exports the playlist as a downloaded jspf document", async () => {
    const { result } = renderHook(() => useRequestActionsFor(makeRequest()));

    await act(async () => {
      await result.current.exportJspf();
    });

    expect(exportCollectionMock).toHaveBeenCalledWith({ id: "req-1", type: "playlist" });
    expect(downloadTextMock).toHaveBeenCalledWith(
      "my-playlist.jspf",
      JSON.stringify({ playlist: { title: "My Playlist" } }, null, 2)
    );
  });

  it("toasts an export failure when the collection export rejects", async () => {
    exportCollectionMock.mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useRequestActionsFor(makeRequest()));

    await act(async () => {
      await result.current.exportJspf();
    });

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("export.failed"));
    expect(downloadTextMock).not.toHaveBeenCalled();
  });
});

describe("useRequestActions album actions", () => {
  beforeEach(() => {
    confirmMock.mockResolvedValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const album = (overrides: Partial<RequestWithTracks> = {}) =>
    makeRequest({ contentType: ContentType.enum.album, ...overrides });

  it("retries the album by id", () => {
    const { result } = renderHook(() => useRequestActionsFor(album()));

    act(() => result.current.retry());

    expect(mutations.retryAlbum).toHaveBeenCalledWith({ albumId: "req-1" });
    expect(mutations.retryPlaylist).not.toHaveBeenCalled();
  });

  it("prioritizes the album by id", () => {
    const { result } = renderHook(() => useRequestActionsFor(album()));

    act(() => result.current.prioritize());

    expect(mutations.prioritizeAlbum).toHaveBeenCalledWith({ albumId: "req-1" });
  });

  it("pauses and resumes the album by id", () => {
    const { result } = renderHook(() => useRequestActionsFor(album()));

    act(() => result.current.pause());
    act(() => result.current.resume());

    expect(mutations.pauseAlbum).toHaveBeenCalledWith({ albumId: "req-1" });
    expect(mutations.resumeAlbum).toHaveBeenCalledWith({ albumId: "req-1" });
  });

  it("removes the album after the user confirms", async () => {
    const { result } = renderHook(() => useRequestActionsFor(album()));

    await act(async () => {
      await result.current.remove();
    });

    expect(mutations.deleteAlbum).toHaveBeenCalledWith({ albumId: "req-1" });
  });

  it("cancels the album downloads after the user confirms", async () => {
    const { result } = renderHook(() => useRequestActionsFor(album()));

    await act(async () => {
      await result.current.cancel();
    });

    expect(mutations.cancelAlbum).toHaveBeenCalledWith({ albumId: "req-1" });
  });

  it("exports the album with the album type", async () => {
    exportCollectionMock.mockResolvedValue({ playlist: { title: "Album" } });
    const { result } = renderHook(() => useRequestActionsFor(album({ name: "Album" })));

    await act(async () => {
      await result.current.exportJspf();
    });

    expect(exportCollectionMock).toHaveBeenCalledWith({ id: "req-1", type: "album" });
  });
});
