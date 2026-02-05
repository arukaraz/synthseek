import { describe, it, expect } from "vitest";
import {
  isSpotifyAlbum,
  isSpotifyTrack,
  isSpotifyTrackSimplified,
  isAnySpotifyTrack,
  getItemDisplayName,
  extractItemMetadata,
} from "../helpers";
import {
  createSpotifyTrackFull,
  createSpotifyTrackSimplified,
  createSpotifyAlbumSimplified,
  createSpotifyArtistFull,
} from "@test/factories";

describe("isSpotifyAlbum", () => {
  it("returns true for valid album object", () => {
    const album = createSpotifyAlbumSimplified();
    expect(isSpotifyAlbum(album)).toBe(true);
  });

  it("returns false for track object", () => {
    const track = createSpotifyTrackFull();
    expect(isSpotifyAlbum(track)).toBe(false);
  });

  it("returns false for null", () => {
    expect(isSpotifyAlbum(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isSpotifyAlbum(undefined)).toBe(false);
  });

  it("returns false for object missing required fields", () => {
    expect(isSpotifyAlbum({ name: "test" })).toBe(false);
  });

  it("returns false for object with non-array artists", () => {
    expect(isSpotifyAlbum({ artists: "not-array", total_tracks: 10 })).toBe(false);
  });
});

describe("isSpotifyTrack", () => {
  it("returns true for full track object", () => {
    const track = createSpotifyTrackFull();
    expect(isSpotifyTrack(track)).toBe(true);
  });

  it("returns false for simplified track (no album)", () => {
    const track = createSpotifyTrackSimplified();
    expect(isSpotifyTrack(track)).toBe(false);
  });

  it("returns false for album object", () => {
    const album = createSpotifyAlbumSimplified();
    expect(isSpotifyTrack(album)).toBe(false);
  });

  it("returns false for null", () => {
    expect(isSpotifyTrack(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isSpotifyTrack(undefined)).toBe(false);
  });
});

describe("isSpotifyTrackSimplified", () => {
  it("returns true for simplified track", () => {
    const track = createSpotifyTrackSimplified();
    expect(isSpotifyTrackSimplified(track)).toBe(true);
  });

  it("returns false for full track (has album)", () => {
    const track = createSpotifyTrackFull();
    expect(isSpotifyTrackSimplified(track)).toBe(false);
  });

  it("returns false for album", () => {
    const album = createSpotifyAlbumSimplified();
    expect(isSpotifyTrackSimplified(album)).toBe(false);
  });

  it("returns false for null", () => {
    expect(isSpotifyTrackSimplified(null)).toBe(false);
  });
});

describe("isAnySpotifyTrack", () => {
  it("returns true for full track", () => {
    const track = createSpotifyTrackFull();
    expect(isAnySpotifyTrack(track)).toBe(true);
  });

  it("returns true for simplified track", () => {
    const track = createSpotifyTrackSimplified();
    expect(isAnySpotifyTrack(track)).toBe(true);
  });

  it("returns false for album", () => {
    const album = createSpotifyAlbumSimplified();
    expect(isAnySpotifyTrack(album)).toBe(false);
  });

  it("returns false for artist", () => {
    const artist = createSpotifyArtistFull();
    expect(isAnySpotifyTrack(artist)).toBe(false);
  });

  it("returns false for null", () => {
    expect(isAnySpotifyTrack(null)).toBe(false);
  });
});

describe("getItemDisplayName", () => {
  it("returns formatted name for album", () => {
    const album = createSpotifyAlbumSimplified({
      name: "Album Name",
      artists: [{ name: "Artist Name" } as SpotifyApi.ArtistObjectSimplified],
    });
    expect(getItemDisplayName(album)).toBe("Artist Name - Album Name");
  });

  it("returns formatted name for track", () => {
    const track = createSpotifyTrackFull({
      name: "Track Name",
      artists: [{ name: "Track Artist" } as SpotifyApi.ArtistObjectSimplified],
    });
    expect(getItemDisplayName(track)).toBe("Track Artist - Track Name");
  });

  it("returns empty string for null", () => {
    expect(getItemDisplayName(null)).toBe("");
  });

  it("handles missing artist name", () => {
    const album = createSpotifyAlbumSimplified({
      name: "Album",
      artists: [],
    });
    expect(getItemDisplayName(album)).toBe("Unknown Artist - Album");
  });

  it("returns name for items without artists array", () => {
    const artist = createSpotifyArtistFull({ name: "Solo Artist" });
    expect(getItemDisplayName(artist)).toBe("Solo Artist");
  });

  it("returns empty string for items without name", () => {
    const artist = createSpotifyArtistFull({ name: "" });
    expect(getItemDisplayName(artist)).toBe("");
  });
});

describe("extractItemMetadata", () => {
  it("extracts metadata from album", () => {
    const album = createSpotifyAlbumSimplified({
      name: "Test Album",
      artists: [{ name: "Album Artist" } as SpotifyApi.ArtistObjectSimplified],
      images: [{ url: "https://album.image", height: 300, width: 300 }],
      release_date: "2024-06-15",
      total_tracks: 12,
    });
    const metadata = extractItemMetadata(album);
    expect(metadata.name).toBe("Test Album");
    expect(metadata.artist).toBe("Album Artist");
    expect(metadata.image).toBe("https://album.image");
    expect(metadata.year).toBe("2024");
    expect(metadata.totalTracks).toBe(12);
    expect(metadata.albumName).toBeUndefined();
  });

  it("extracts metadata from full track", () => {
    const track = createSpotifyTrackFull({
      name: "Test Track",
      artists: [{ name: "Track Artist" } as SpotifyApi.ArtistObjectSimplified],
      album: {
        name: "Parent Album",
        images: [{ url: "https://track.album.image", height: 300, width: 300 }],
        release_date: "2023-03-20",
      } as SpotifyApi.AlbumObjectSimplified,
    });
    const metadata = extractItemMetadata(track);
    expect(metadata.name).toBe("Test Track");
    expect(metadata.artist).toBe("Track Artist");
    expect(metadata.image).toBe("https://track.album.image");
    expect(metadata.year).toBe("2023");
    expect(metadata.albumName).toBe("Parent Album");
    expect(metadata.totalTracks).toBeUndefined();
  });

  it("extracts metadata from simplified track with parent album", () => {
    const track = createSpotifyTrackSimplified({
      name: "Simplified Track",
      artists: [{ name: "Simple Artist" } as SpotifyApi.ArtistObjectSimplified],
    });
    const parentAlbum = createSpotifyAlbumSimplified({
      name: "Parent Album",
      images: [{ url: "https://parent.image", height: 300, width: 300 }],
      release_date: "2022-01-01",
    });
    const metadata = extractItemMetadata(track, parentAlbum);
    expect(metadata.name).toBe("Simplified Track");
    expect(metadata.artist).toBe("Simple Artist");
    expect(metadata.image).toBe("https://parent.image");
    expect(metadata.year).toBe("2022");
    expect(metadata.albumName).toBe("Parent Album");
  });

  it("returns empty metadata for null item", () => {
    const metadata = extractItemMetadata(null);
    expect(metadata.name).toBe("");
    expect(metadata.artist).toBeUndefined();
    expect(metadata.image).toBeUndefined();
    expect(metadata.year).toBeUndefined();
    expect(metadata.totalTracks).toBeUndefined();
    expect(metadata.albumName).toBeUndefined();
  });
});
