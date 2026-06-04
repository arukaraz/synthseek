import { describe, it, expect } from "vitest";
import {
  buildAlbumDelegate,
  buildArtistDelegate,
  buildSourceChain,
  extractItemMetadata,
  getAvailableAcquisitionOptions,
  getItemDisplayName,
  isAcquisitionMethod,
  isAlbum,
  isLidarrMethod,
  isLidarrSelectionComplete,
  isTrack,
  showsSlskdControls,
} from "../helpers";
import { createMockTrackFull, createMockAlbumSimplified } from "@test/factories";
import type { LidarrArtistSelection, LidarrSelection } from "../types";

const BOTH_ENABLED = { slskd: true, ytdlp: true };
const NON_ALBUM_CONTEXT = { isAlbum: false, lidarrAvailable: false };
const ALBUM_NO_LIDARR = { isAlbum: true, lidarrAvailable: false };
const ALBUM_WITH_LIDARR = { isAlbum: true, lidarrAvailable: true };

const COMPLETE_SELECTION: LidarrSelection = {
  rootFolderPath: "/music",
  qualityProfileId: 1,
  metadataProfileId: 2,
  monitor: "album",
};

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

describe("buildSourceChain", () => {
  it("returns undefined for auto so global behavior is preserved", () => {
    expect(buildSourceChain("auto", BOTH_ENABLED)).toBeUndefined();
  });

  it("maps slskd to a single-source chain", () => {
    expect(buildSourceChain("slskd", BOTH_ENABLED)).toEqual(["slskd"]);
  });

  it("maps ytdlp to a single-source chain", () => {
    expect(buildSourceChain("ytdlp", BOTH_ENABLED)).toEqual(["ytdlp"]);
  });

  it("preserves order for the combined chain", () => {
    expect(buildSourceChain("slskdThenYtdlp", BOTH_ENABLED)).toEqual(["slskd", "ytdlp"]);
  });

  it("drops disabled sources and falls back to undefined when nothing remains", () => {
    expect(buildSourceChain("slskd", { slskd: false, ytdlp: true })).toBeUndefined();
  });

  it("drops a disabled source from a combined chain", () => {
    expect(buildSourceChain("slskdThenYtdlp", { slskd: true, ytdlp: false })).toEqual(["slskd"]);
  });

  it("returns undefined for lidarr so no sourceChain is sent", () => {
    expect(buildSourceChain("lidarr", BOTH_ENABLED)).toBeUndefined();
  });
});

describe("getAvailableAcquisitionOptions", () => {
  it("always includes auto", () => {
    const values = getAvailableAcquisitionOptions({ slskd: false, ytdlp: false }, NON_ALBUM_CONTEXT).map(
      (o) => o.value
    );
    expect(values).toEqual(["auto"]);
  });

  it("offers slskd only when slskd is enabled", () => {
    const values = getAvailableAcquisitionOptions({ slskd: true, ytdlp: false }, NON_ALBUM_CONTEXT).map((o) => o.value);
    expect(values).toEqual(["auto", "slskd"]);
  });

  it("offers the combined chain only when both sources are enabled", () => {
    const values = getAvailableAcquisitionOptions(BOTH_ENABLED, NON_ALBUM_CONTEXT).map((o) => o.value);
    expect(values).toEqual(["auto", "slskd", "ytdlp", "slskdThenYtdlp"]);
  });

  it("offers lidarr only for albums when Lidarr is available", () => {
    const values = getAvailableAcquisitionOptions(BOTH_ENABLED, ALBUM_WITH_LIDARR).map((o) => o.value);
    expect(values).toEqual(["auto", "slskd", "ytdlp", "slskdThenYtdlp", "lidarr"]);
  });

  it("omits lidarr for albums when Lidarr is unavailable", () => {
    const values = getAvailableAcquisitionOptions(BOTH_ENABLED, ALBUM_NO_LIDARR).map((o) => o.value);
    expect(values).not.toContain("lidarr");
  });

  it("omits lidarr for non-albums even when Lidarr is available", () => {
    const values = getAvailableAcquisitionOptions(BOTH_ENABLED, {
      isAlbum: false,
      lidarrAvailable: true,
    }).map((o) => o.value);
    expect(values).not.toContain("lidarr");
  });
});

describe("showsSlskdControls", () => {
  it("keeps slskd-only controls visible for auto", () => {
    expect(showsSlskdControls("auto")).toBe(true);
  });

  it("keeps slskd-only controls visible for slskd-containing chains", () => {
    expect(showsSlskdControls("slskd")).toBe(true);
    expect(showsSlskdControls("slskdThenYtdlp")).toBe(true);
  });

  it("hides slskd-only controls for ytdlp", () => {
    expect(showsSlskdControls("ytdlp")).toBe(false);
  });

  it("hides slskd-only controls for lidarr", () => {
    expect(showsSlskdControls("lidarr")).toBe(false);
  });
});

describe("isAcquisitionMethod", () => {
  it("accepts known methods", () => {
    expect(isAcquisitionMethod("auto")).toBe(true);
    expect(isAcquisitionMethod("slskdThenYtdlp")).toBe(true);
    expect(isAcquisitionMethod("lidarr")).toBe(true);
  });

  it("rejects unknown values", () => {
    expect(isAcquisitionMethod("plex")).toBe(false);
    expect(isAcquisitionMethod("")).toBe(false);
  });
});

describe("isLidarrMethod", () => {
  it("returns true only for the lidarr method", () => {
    expect(isLidarrMethod("lidarr")).toBe(true);
    expect(isLidarrMethod("auto")).toBe(false);
    expect(isLidarrMethod("slskd")).toBe(false);
  });
});

describe("isLidarrSelectionComplete", () => {
  it("returns true when all three profile fields are set", () => {
    expect(isLidarrSelectionComplete(COMPLETE_SELECTION)).toBe(true);
  });

  it("returns false when the root folder is missing", () => {
    expect(isLidarrSelectionComplete({ ...COMPLETE_SELECTION, rootFolderPath: undefined })).toBe(false);
  });

  it("returns false when the quality profile is missing", () => {
    expect(isLidarrSelectionComplete({ ...COMPLETE_SELECTION, qualityProfileId: undefined })).toBe(false);
  });

  it("returns false when the metadata profile is missing", () => {
    expect(isLidarrSelectionComplete({ ...COMPLETE_SELECTION, metadataProfileId: undefined })).toBe(false);
  });
});

describe("buildAlbumDelegate", () => {
  it("builds a delegate payload from a complete selection", () => {
    expect(buildAlbumDelegate(COMPLETE_SELECTION)).toEqual({
      manager: "lidarr",
      rootFolderPath: "/music",
      qualityProfileId: 1,
      metadataProfileId: 2,
      monitor: "album",
    });
  });

  it("preserves the artist monitor scope", () => {
    const delegate = buildAlbumDelegate({ ...COMPLETE_SELECTION, monitor: "artist" });
    expect(delegate?.monitor).toBe("artist");
  });

  it("returns undefined when the selection is incomplete", () => {
    expect(buildAlbumDelegate({ ...COMPLETE_SELECTION, qualityProfileId: undefined })).toBeUndefined();
  });
});

const COMPLETE_ARTIST_SELECTION: LidarrArtistSelection = {
  rootFolderPath: "/music",
  qualityProfileId: 1,
  metadataProfileId: 2,
  monitor: "all",
};

describe("buildArtistDelegate", () => {
  it("builds a delegate payload from a complete selection", () => {
    expect(buildArtistDelegate("Boards of Canada", COMPLETE_ARTIST_SELECTION)).toEqual({
      artistName: "Boards of Canada",
      rootFolderPath: "/music",
      qualityProfileId: 1,
      metadataProfileId: 2,
      monitor: "all",
    });
  });

  it("omits artistMbid when not provided", () => {
    const delegate = buildArtistDelegate("Aphex Twin", COMPLETE_ARTIST_SELECTION);
    expect(delegate).not.toHaveProperty("artistMbid");
  });

  it("includes artistMbid when provided", () => {
    const delegate = buildArtistDelegate("Aphex Twin", COMPLETE_ARTIST_SELECTION, "mbid-123");
    expect(delegate?.artistMbid).toBe("mbid-123");
  });

  it("preserves each artist monitor scope", () => {
    for (const monitor of ["all", "future", "missing", "none"] as const) {
      const delegate = buildArtistDelegate("Artist", { ...COMPLETE_ARTIST_SELECTION, monitor });
      expect(delegate?.monitor).toBe(monitor);
    }
  });

  it("returns undefined when the selection is incomplete", () => {
    expect(
      buildArtistDelegate("Artist", { ...COMPLETE_ARTIST_SELECTION, metadataProfileId: undefined })
    ).toBeUndefined();
  });
});
