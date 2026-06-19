import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";

import type { MusicAlbum, MusicArtist, MusicItem, MusicPlaylist, MusicTrack } from "@api/__generated__/types";
import { useContentRequestModals } from "../useContentRequestModals";

function makeTrack(id: string): MusicTrack {
  return {
    type: "track",
    id,
    title: `Track ${id}`,
    artist: "Artist",
    artists: [{ id: "a1", name: "Artist" }],
    album: { id: "al1", name: "Album", images: [] },
    duration_ms: 1000,
    track_number: 1,
    disc_number: 1,
    isrc: null,
    explicit: false,
    popularity: null,
    preview_url: null,
    images: [],
  };
}

function makeAlbum(id: string): MusicAlbum {
  return {
    type: "album",
    id,
    name: `Album ${id}`,
    artist: "Artist",
    artists: [{ id: "a1", name: "Artist" }],
    images: [],
    release_date: "2024-01-01",
    total_tracks: 0,
    genres: [],
    label: null,
    upc: null,
    tracks: [],
  };
}

function makeArtist(id: string): MusicArtist {
  return { type: "artist", id, name: `Artist ${id}`, images: [], genres: [], followers: null };
}

function makePlaylist(id: string): MusicPlaylist {
  return {
    type: "playlist",
    id,
    name: `Playlist ${id}`,
    description: null,
    images: [],
    owner: { id: "o1", name: "Owner" },
    total_tracks: 0,
    tracks: [],
  };
}

describe("useContentRequestModals", () => {
  it("opens the config modal directly when openForResult receives a track", () => {
    const { result } = renderHook(() => useContentRequestModals());
    const track = makeTrack("t1");

    act(() => result.current.openForResult(track));

    expect(result.current.contentDetailModalProps.open).toBe(false);
    expect(result.current.configModalProps.isOpen).toBe(true);
    expect(result.current.selectedResult).toEqual(track);
    expect(result.current.selectedContentToRequest).toEqual(track);
    expect(result.current.configModalProps.item).toEqual(track);
    expect(result.current.configModalProps.itemType).toBe("track");
    expect(result.current.configModalProps.mode).toBe("download");
  });

  it("opens the browser modal when openForResult receives a non-track item", () => {
    const { result } = renderHook(() => useContentRequestModals());
    const artist = makeArtist("ar1");

    act(() => result.current.openForResult(artist));

    expect(result.current.contentDetailModalProps.open).toBe(true);
    expect(result.current.configModalProps.isOpen).toBe(false);
    expect(result.current.selectedResult).toEqual(artist);
    expect(result.current.selectedContentToRequest).toBeNull();
  });

  it("requestContent accepts album and surfaces the parent album from context", () => {
    const { result } = renderHook(() => useContentRequestModals());
    const album = makeAlbum("al1");
    const parent = makeAlbum("parent");

    act(() => result.current.contentDetailModalProps.onRequestClick(album, { parentAlbum: parent }));

    expect(result.current.configModalProps.isOpen).toBe(true);
    expect(result.current.contentDetailModalProps.open).toBe(false);
    expect(result.current.selectedContentToRequest).toEqual(album);
    expect(result.current.configModalProps.itemType).toBe("album");
    expect(result.current.configModalProps.parentAlbum).toEqual(parent);
    expect(result.current.configModalProps.mode).toBe("download");
  });

  it("requestContent accepts a playlist, the type discover callers previously dropped", () => {
    const { result } = renderHook(() => useContentRequestModals());
    const playlist = makePlaylist("p1");

    act(() => result.current.contentDetailModalProps.onRequestClick(playlist));

    expect(result.current.configModalProps.isOpen).toBe(true);
    expect(result.current.selectedContentToRequest).toEqual(playlist);
    expect(result.current.configModalProps.itemType).toBe("playlist");
  });

  it("requestPlaylistConfig opens the config modal with preloaded tracks for a playlist", () => {
    const { result } = renderHook(() => useContentRequestModals());
    const playlist = makePlaylist("p1");
    const tracks = [makeTrack("t1"), makeTrack("t2")];

    act(() => result.current.requestPlaylistConfig(playlist, tracks));

    expect(result.current.configModalProps.isOpen).toBe(true);
    expect(result.current.contentDetailModalProps.open).toBe(false);
    expect(result.current.selectedContentToRequest).toEqual(playlist);
    expect(result.current.configModalProps.itemType).toBe("playlist");
    expect(result.current.configModalProps.mode).toBe("download");
    expect(result.current.configModalProps.preloadedTracks).toEqual(tracks);
  });

  it("requestPlaylistConfig is a no-op for a non-playlist item", () => {
    const { result } = renderHook(() => useContentRequestModals());
    const album = makeAlbum("al1");

    act(() => result.current.requestPlaylistConfig(album, [makeTrack("t1")]));

    expect(result.current.configModalProps.isOpen).toBe(false);
    expect(result.current.selectedContentToRequest).toBeNull();
    expect(result.current.configModalProps.preloadedTracks).toBeUndefined();
  });

  it("ignores requestContent for an artist", () => {
    const { result } = renderHook(() => useContentRequestModals());
    const artist = makeArtist("ar1");

    act(() => result.current.contentDetailModalProps.onRequestClick(artist));

    expect(result.current.configModalProps.isOpen).toBe(false);
    expect(result.current.selectedContentToRequest).toBeNull();
  });

  it("requestArtistLidarr guards on artist and sets the lidarr-artist mode", () => {
    const { result } = renderHook(() => useContentRequestModals());
    const artist = makeArtist("ar1");

    act(() => result.current.requestArtistLidarr(artist));

    expect(result.current.configModalProps.isOpen).toBe(true);
    expect(result.current.contentDetailModalProps.open).toBe(false);
    expect(result.current.selectedContentToRequest).toEqual(artist);
    expect(result.current.configModalProps.mode).toBe("lidarr-artist");
  });

  it("requestArtistLidarr is a no-op for a non-artist item", () => {
    const { result } = renderHook(() => useContentRequestModals());
    const album: MusicItem = makeAlbum("al1");

    act(() => result.current.requestArtistLidarr(album));

    expect(result.current.configModalProps.isOpen).toBe(false);
    expect(result.current.selectedContentToRequest).toBeNull();
  });

  it("closeBrowser clears the selected result and closes the browser modal", () => {
    const { result } = renderHook(() => useContentRequestModals());
    const artist = makeArtist("ar1");

    act(() => result.current.openForResult(artist));
    act(() => result.current.contentDetailModalProps.onClose());

    expect(result.current.contentDetailModalProps.open).toBe(false);
    expect(result.current.selectedResult).toBeNull();
  });

  it("closeConfig resets the request state back to defaults", () => {
    const { result } = renderHook(() => useContentRequestModals());
    const artist = makeArtist("ar1");

    act(() => result.current.requestArtistLidarr(artist));
    act(() => result.current.configModalProps.onClose());

    expect(result.current.configModalProps.isOpen).toBe(false);
    expect(result.current.selectedContentToRequest).toBeNull();
    expect(result.current.configModalProps.parentAlbum).toBeNull();
    expect(result.current.configModalProps.mode).toBe("download");
  });
});
