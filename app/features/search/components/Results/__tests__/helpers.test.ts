import { describe, it, expect } from "vitest";
import {
  transformResultForDisplay,
  getSecondaryInfo,
  getTypeBadgeLabel,
  getTypeBadgeColors,
  transformPlaylistTrackForDisplay,
  MAX_RESULTS_DISPLAY,
} from "../helpers";
import { ContentType } from "@api/__generated__/types";
import {
  createMockTrackFull,
  createMockAlbumSimplified,
  createMockArtistFull,
  createMockPlaylistSimplified,
  createMockPlaylistTrack,
} from "@test/factories";

describe("transformResultForDisplay", () => {
  it("transforms full track with album correctly", () => {
    const track = createMockTrackFull({
      id: "track-1",
      title: "Test Song",
      name: "Test Song",
      artists: [{ id: "a1", name: "Test Artist" }],
      album: {
        name: "Test Album",
        images: [{ url: "https://image.url", height: 300, width: 300 }],
        release_date: "2024-05-15",
      },
    });
    const result = transformResultForDisplay(track);
    expect(result.id).toBe("track-1");
    expect(result.type).toBe("track");
    expect(result.name).toBe("Test Song");
    expect(result.artist).toBe("Test Artist");
    expect(result.album).toBe("Test Album");
    expect(result.image).toBe("https://image.url");
  });

  it("transforms album correctly", () => {
    const album = createMockAlbumSimplified({
      id: "album-1",
      name: "Test Album",
      artists: [{ id: "a1", name: "Album Artist" }],
      images: [{ url: "https://album.image", height: 300, width: 300 }],
      release_date: "2023-01-01",
    });
    const result = transformResultForDisplay(album);
    expect(result.id).toBe("album-1");
    expect(result.type).toBe("album");
    expect(result.name).toBe("Test Album");
    expect(result.artist).toBe("Album Artist");
    expect(result.image).toBe("https://album.image");
    expect(result.year).toBe("2023");
  });

  it("transforms artist correctly", () => {
    const artist = createMockArtistFull({
      id: "artist-1",
      name: "Famous Artist",
      images: [{ url: "https://artist.image", height: 300, width: 300 }],
    });
    const result = transformResultForDisplay(artist);
    expect(result.id).toBe("artist-1");
    expect(result.type).toBe("artist");
    expect(result.name).toBe("Famous Artist");
    expect(result.artist).toBe("Famous Artist");
    expect(result.image).toBe("https://artist.image");
  });

  it("transforms playlist correctly", () => {
    const playlist = createMockPlaylistSimplified({
      id: "playlist-1",
      name: "My Playlist",
      owner: { id: "u1", name: "Playlist Owner" },
      images: [{ url: "https://playlist.image", height: 300, width: 300 }],
    });
    const result = transformResultForDisplay(playlist);
    expect(result.id).toBe("playlist-1");
    expect(result.type).toBe("playlist");
    expect(result.name).toBe("My Playlist");
    expect(result.artist).toBe("Playlist Owner");
    expect(result.image).toBe("https://playlist.image");
  });

  it("handles missing artist name", () => {
    const track = createMockTrackFull({ artists: [] });
    const result = transformResultForDisplay(track);
    expect(result.artist).toBe("Unknown Artist");
  });

  it("handles missing playlist owner name", () => {
    const playlist = createMockPlaylistSimplified({
      owner: { id: "u1", name: "" },
    });
    const result = transformResultForDisplay(playlist);
    expect(result.artist).toBe("Unknown");
  });
});

describe("getSecondaryInfo", () => {
  it("returns artist and year for album", () => {
    const result = getSecondaryInfo({
      id: "1",
      type: ContentType.enum.album,
      name: "Album",
      artist: "Artist",
      year: "2024",
    });
    expect(result).toBe("Artist • 2024");
  });

  it("returns artist and album for track", () => {
    const result = getSecondaryInfo({
      id: "1",
      type: ContentType.enum.track,
      name: "Track",
      artist: "Artist",
      album: "Album Name",
    });
    expect(result).toBe("Artist • Album Name");
  });

  it("returns empty string for artist type without year", () => {
    const result = getSecondaryInfo({
      id: "1",
      type: ContentType.enum.artist,
      name: "Artist Name",
      artist: "Artist Name",
    });
    expect(result).toBe("");
  });

  it("returns artist for playlist", () => {
    const result = getSecondaryInfo({
      id: "1",
      type: ContentType.enum.playlist,
      name: "Playlist",
      artist: "Playlist Owner",
    });
    expect(result).toBe("Playlist Owner");
  });
});

describe("getTypeBadgeLabel", () => {
  it("capitalizes track", () => {
    expect(getTypeBadgeLabel(ContentType.enum.track)).toBe("Track");
  });
  it("capitalizes album", () => {
    expect(getTypeBadgeLabel(ContentType.enum.album)).toBe("Album");
  });
  it("capitalizes artist", () => {
    expect(getTypeBadgeLabel(ContentType.enum.artist)).toBe("Artist");
  });
  it("capitalizes playlist", () => {
    expect(getTypeBadgeLabel(ContentType.enum.playlist)).toBe("Playlist");
  });
});

describe("getTypeBadgeColors", () => {
  it("returns correct colors for album", () => {
    expect(getTypeBadgeColors(ContentType.enum.album)).toContain("bg-primary-500");
  });
  it("returns correct colors for track", () => {
    expect(getTypeBadgeColors(ContentType.enum.track)).toContain("bg-accent-500");
  });
  it("returns correct colors for artist", () => {
    expect(getTypeBadgeColors(ContentType.enum.artist)).toContain("bg-secondary-500");
  });
  it("returns correct colors for playlist", () => {
    expect(getTypeBadgeColors(ContentType.enum.playlist)).toContain("bg-emerald-500");
  });
});

describe("transformPlaylistTrackForDisplay", () => {
  it("transforms valid playlist track", () => {
    const playlistTrack = createMockPlaylistTrack();
    const result = transformPlaylistTrackForDisplay(playlistTrack);
    expect(result).not.toBeNull();
    expect(result?.type).toBe(ContentType.enum.track);
  });

  it("returns null for null track", () => {
    const result = transformPlaylistTrackForDisplay({ track: null } as never);
    expect(result).toBeNull();
  });

  it("extracts track info correctly", () => {
    const playlistTrack = createMockPlaylistTrack({
      track: createMockTrackFull({
        id: "pt-track-1",
        title: "Playlist Track",
        name: "Playlist Track",
        artists: [{ id: "a1", name: "PT Artist" }],
      }),
    });
    const result = transformPlaylistTrackForDisplay(playlistTrack);
    expect(result?.id).toBe("pt-track-1");
    expect(result?.name).toBe("Playlist Track");
    expect(result?.artist).toBe("PT Artist");
  });
});

describe("MAX_RESULTS_DISPLAY", () => {
  it("equals 12", () => {
    expect(MAX_RESULTS_DISPLAY).toBe(12);
  });
});
