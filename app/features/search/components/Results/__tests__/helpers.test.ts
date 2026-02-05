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
  createSpotifyTrackFull,
  createSpotifyTrackSimplified,
  createSpotifyAlbumSimplified,
  createSpotifyArtistFull,
  createSpotifyPlaylistSimplified,
  createSpotifyPlaylistTrack,
} from "@test/factories";

describe("transformResultForDisplay", () => {
  it("transforms full track with album correctly", () => {
    const track = createSpotifyTrackFull({
      id: "track-1",
      name: "Test Song",
      artists: [{ name: "Test Artist" } as SpotifyApi.ArtistObjectSimplified],
      album: {
        name: "Test Album",
        images: [{ url: "https://image.url", height: 300, width: 300 }],
        release_date: "2024-05-15",
      } as SpotifyApi.AlbumObjectSimplified,
    });
    const result = transformResultForDisplay(track);
    expect(result.id).toBe("track-1");
    expect(result.type).toBe("track");
    expect(result.name).toBe("Test Song");
    expect(result.artist).toBe("Test Artist");
    expect(result.album).toBe("Test Album");
    expect(result.image).toBe("https://image.url");
    expect(result.year).toBe("2024");
  });

  it("transforms simplified track without album", () => {
    const track = createSpotifyTrackSimplified({
      id: "track-2",
      name: "Simplified Song",
      artists: [{ name: "Artist" } as SpotifyApi.ArtistObjectSimplified],
    });
    const result = transformResultForDisplay(track);
    expect(result.id).toBe("track-2");
    expect(result.name).toBe("Simplified Song");
    expect(result.album).toBeUndefined();
    expect(result.image).toBeUndefined();
  });

  it("transforms album correctly", () => {
    const album = createSpotifyAlbumSimplified({
      id: "album-1",
      name: "Test Album",
      artists: [{ name: "Album Artist" } as SpotifyApi.ArtistObjectSimplified],
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
    const artist = createSpotifyArtistFull({
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
    const playlist = createSpotifyPlaylistSimplified({
      id: "playlist-1",
      name: "My Playlist",
      owner: { display_name: "Playlist Owner" } as SpotifyApi.UserObjectPublic,
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
    const track = createSpotifyTrackFull({
      artists: [],
    });
    const result = transformResultForDisplay(track);
    expect(result.artist).toBe("Unknown Artist");
  });

  it("handles missing playlist owner display_name", () => {
    const playlist = createSpotifyPlaylistSimplified({
      owner: { display_name: "" } as SpotifyApi.UserObjectPublic,
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

  it("returns year for artist type with year", () => {
    const result = getSecondaryInfo({
      id: "1",
      type: ContentType.enum.artist,
      name: "Artist Name",
      artist: "Artist Name",
      year: "1990",
    });
    expect(result).toBe("1990");
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

  it("filters out undefined values for album", () => {
    const result = getSecondaryInfo({
      id: "1",
      type: ContentType.enum.album,
      name: "Album",
      artist: "Artist",
    });
    expect(result).toBe("Artist");
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
    const colors = getTypeBadgeColors(ContentType.enum.album);
    expect(colors).toContain("bg-primary-500");
    expect(colors).toContain("border-primary-400");
  });

  it("returns correct colors for track", () => {
    const colors = getTypeBadgeColors(ContentType.enum.track);
    expect(colors).toContain("bg-accent-500");
    expect(colors).toContain("border-accent-400");
  });

  it("returns correct colors for artist", () => {
    const colors = getTypeBadgeColors(ContentType.enum.artist);
    expect(colors).toContain("bg-secondary-500");
    expect(colors).toContain("border-secondary-400");
  });

  it("returns correct colors for playlist", () => {
    const colors = getTypeBadgeColors(ContentType.enum.playlist);
    expect(colors).toContain("bg-emerald-500");
    expect(colors).toContain("border-emerald-400");
  });
});

describe("transformPlaylistTrackForDisplay", () => {
  it("transforms valid playlist track", () => {
    const playlistTrack = createSpotifyPlaylistTrack();
    const result = transformPlaylistTrackForDisplay(playlistTrack);
    expect(result).not.toBeNull();
    expect(result?.type).toBe(ContentType.enum.track);
  });

  it("returns null for null track", () => {
    const playlistTrack = { ...createSpotifyPlaylistTrack(), track: null };
    const result = transformPlaylistTrackForDisplay(
      playlistTrack as unknown as SpotifyApi.PlaylistTrackObject
    );
    expect(result).toBeNull();
  });

  it("returns null for non-track type in playlist", () => {
    const playlistTrack = {
      ...createSpotifyPlaylistTrack(),
      track: { ...createSpotifyTrackFull(), type: ContentType.enum.album },
    };
    const result = transformPlaylistTrackForDisplay(
      playlistTrack as unknown as SpotifyApi.PlaylistTrackObject
    );
    expect(result).toBeNull();
  });

  it("extracts track info correctly", () => {
    const playlistTrack = createSpotifyPlaylistTrack({
      track: createSpotifyTrackFull({
        id: "pt-track-1",
        name: "Playlist Track",
        artists: [{ name: "PT Artist" } as SpotifyApi.ArtistObjectSimplified],
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
