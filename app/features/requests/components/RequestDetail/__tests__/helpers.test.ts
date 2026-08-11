import { ContentType } from "@api/__generated__/types";
import { describe, it, expect } from "vitest";

import { makeRequestWithTracks } from "../../../__tests__/factories";
import { formatDelegatedTo, requestDetailTarget } from "../helpers";

describe("formatDelegatedTo", () => {
  it("title-cases a manager key", () => {
    expect(formatDelegatedTo("lidarr")).toBe("Lidarr");
  });

  it("returns null for null", () => {
    expect(formatDelegatedTo(null)).toBeNull();
  });

  it("returns null for an empty string", () => {
    expect(formatDelegatedTo("")).toBeNull();
  });

  it("returns null for whitespace only", () => {
    expect(formatDelegatedTo("   ")).toBeNull();
  });

  it("trims surrounding whitespace before formatting", () => {
    expect(formatDelegatedTo("  lidarr  ")).toBe("Lidarr");
  });
});

describe("requestDetailTarget", () => {
  it("builds a catalog album target keyed by the provider external_id", () => {
    const request = makeRequestWithTracks({
      contentType: ContentType.enum.album,
      id: "album-row-1",
      external_id: "123456",
      name: "Random Access Memories",
      artist: "Daft Punk",
      album_art: "https://example.com/cover.jpg",
    });

    expect(requestDetailTarget(request)).toEqual({
      mode: "album",
      id: "123456",
      name: "Random Access Memories",
      artistName: "Daft Punk",
      cover: "https://example.com/cover.jpg",
    });
  });

  it("builds a library playlist target keyed by the local row id, not the external_id", () => {
    const request = makeRequestWithTracks({
      contentType: ContentType.enum.playlist,
      id: "playlist-row-1",
      external_id: "local_abc123",
      name: "Summer Mix",
      artist: "alice",
      album_art: null,
    });

    expect(requestDetailTarget(request)).toEqual({
      mode: "playlist",
      id: "playlist-row-1",
      name: "Summer Mix",
      artistName: "Summer Mix",
      cover: null,
      playlistSource: "library",
    });
  });

  it("returns no target for an artist request", () => {
    expect(requestDetailTarget(makeRequestWithTracks({ contentType: ContentType.enum.artist }))).toBeNull();
  });

  it("returns no target for a track request", () => {
    expect(requestDetailTarget(makeRequestWithTracks({ contentType: ContentType.enum.track }))).toBeNull();
  });
});
