import { describe, it, expect } from "vitest";
import { isAlbum, isTrack, getItemDisplayName, extractItemMetadata } from "../helpers";
import { createMockTrackFull, createMockAlbumSimplified } from "@test/factories";

describe("isAlbum", () => {
  it("returns true for valid album object", () => {
    expect(isAlbum(createMockAlbumSimplified())).toBe(true);
  });

  it("returns false for track object", () => {
    expect(isAlbum(createMockTrackFull())).toBe(false);
  });

  it("returns false for null", () => {
    expect(isAlbum(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isAlbum(undefined)).toBe(false);
  });

  it("returns false for object missing required fields", () => {
    expect(isAlbum({ name: "test" })).toBe(false);
  });
});

describe("isTrack", () => {
  it("returns true for full track object", () => {
    expect(isTrack(createMockTrackFull())).toBe(true);
  });

  it("returns false for album object", () => {
    expect(isTrack(createMockAlbumSimplified())).toBe(false);
  });

  it("returns false for null", () => {
    expect(isTrack(null)).toBe(false);
  });
});

describe("getItemDisplayName", () => {
  it("returns formatted name for album", () => {
    const album = createMockAlbumSimplified({
      name: "Album Name",
      artists: [{ id: "a1", name: "Artist Name" }],
    });
    expect(getItemDisplayName(album)).toBe("Artist Name - Album Name");
  });

  it("returns formatted name for track", () => {
    const track = createMockTrackFull({
      title: "Track Name",
      name: "Track Name",
      artists: [{ id: "a1", name: "Track Artist" }],
    });
    expect(getItemDisplayName(track)).toBe("Track Artist - Track Name");
  });

  it("returns empty string for null", () => {
    expect(getItemDisplayName(null)).toBe("");
  });

  it("handles missing artist name", () => {
    const album = createMockAlbumSimplified({ name: "Album", artists: [] });
    expect(getItemDisplayName(album)).toBe("Unknown Artist - Album");
  });
});

describe("extractItemMetadata", () => {
  it("extracts metadata from album", () => {
    const album = createMockAlbumSimplified({
      name: "Test Album",
      artists: [{ id: "a1", name: "Album Artist" }],
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
  });

  it("extracts metadata from full track", () => {
    const track = createMockTrackFull({
      title: "Test Track",
      name: "Test Track",
      artists: [{ id: "a1", name: "Track Artist" }],
      album: {
        name: "Parent Album",
        images: [{ url: "https://track.album.image", height: 300, width: 300 }],
        release_date: "2023-03-20",
      },
    });
    const metadata = extractItemMetadata(track);
    expect(metadata.name).toBe("Test Track");
    expect(metadata.artist).toBe("Track Artist");
    expect(metadata.image).toBe("https://track.album.image");
    expect(metadata.albumName).toBe("Parent Album");
  });

  it("returns empty metadata for null item", () => {
    const metadata = extractItemMetadata(null);
    expect(metadata.name).toBe("");
    expect(metadata.artist).toBeUndefined();
    expect(metadata.image).toBeUndefined();
  });
});
