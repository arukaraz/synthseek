import { describe, it, expect } from "vitest";
import {
  addTag,
  allowsLossless,
  buildAlbumDelegate,
  buildArtistDelegate,
  buildMetadataProfileOptions,
  buildQualityProfileOptions,
  buildRootFolderOptions,
  buildSourceChain,
  extractItemMetadata,
  filterTagSuggestions,
  formatFreeSpace,
  getAvailableAcquisitionOptions,
  getItemDisplayName,
  offersUsenet,
  hasTag,
  isAcquisitionMethod,
  isAlbum,
  isLidarrMethod,
  isLidarrSelectionComplete,
  isTrack,
  mapTrackFields,
  normalizeTag,
  removeTag,
  showsSlskdControls,
} from "../helpers";
import { createMockTrackFull, createMockAlbumSimplified, createMockPlaylistSimplified } from "@test/factories";
import type { LidarrArtistSelection, LidarrSelection } from "../types";

const BOTH_ENABLED = { slskd: true, ytdlp: true, usenet: false };
const ALL_ENABLED = { slskd: true, ytdlp: true, usenet: true };
const NON_ALBUM_CONTEXT = { isAlbum: false, lidarrAvailable: false, usenetAllowsSingleTracks: false };
const ALBUM_NO_LIDARR = { isAlbum: true, lidarrAvailable: false, usenetAllowsSingleTracks: false };
const ALBUM_WITH_LIDARR = { isAlbum: true, lidarrAvailable: true, usenetAllowsSingleTracks: false };
const NON_ALBUM_OPTED_IN = { isAlbum: false, lidarrAvailable: false, usenetAllowsSingleTracks: true };

const COMPLETE_SELECTION: LidarrSelection = {
  rootFolderPath: "/music",
  qualityProfileId: 1,
  metadataProfileId: 2,
  monitor: "album",
  tags: [],
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

  it("returns the album name alone when the artist is unknown, never an Unknown prefix", () => {
    const album = createMockAlbumSimplified({ name: "Album", artists: [] });
    expect(getItemDisplayName(album)).toBe("Album");
  });

  it("returns only the name for an artist item", () => {
    const artist = { id: "ar1", type: "artist", name: "Solo Artist", images: [] };
    expect(getItemDisplayName(artist)).toBe("Solo Artist");
  });

  it("returns the playlist name alone, never an owner or Unknown prefix", () => {
    const playlist = createMockPlaylistSimplified({ name: "MYX PHILIPPINES", owner: { id: "u1", name: "" } });
    expect(getItemDisplayName(playlist)).toBe("MYX PHILIPPINES");
  });

  it("returns an empty string when the item has no name", () => {
    const album = createMockAlbumSimplified({ name: "", artists: [] });
    expect(getItemDisplayName(album)).toBe("");
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

  it("falls back to the parent album for image, year and name when the item lacks them", () => {
    const track = createMockTrackFull({
      title: "Bare Track",
      name: "Bare Track",
      images: [],
      album: { name: "", images: [], release_date: "" },
    });
    const parentAlbum = createMockAlbumSimplified({
      name: "Parent Album",
      images: [{ url: "https://parent.image", height: 300, width: 300 }],
      release_date: "2021-05-10",
    });

    const metadata = extractItemMetadata(track, parentAlbum);

    expect(metadata.image).toBe("https://parent.image");
    expect(metadata.year).toBe("2021");
    expect(metadata.albumName).toBe("Parent Album");
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

  it("builds a usenet-only chain when usenet is enabled", () => {
    expect(buildSourceChain("usenet", ALL_ENABLED)).toEqual(["usenet"]);
  });

  it("returns undefined for usenet when the source is disabled", () => {
    expect(buildSourceChain("usenet", BOTH_ENABLED)).toBeUndefined();
  });
});

describe("getAvailableAcquisitionOptions", () => {
  it("always includes auto", () => {
    const values = getAvailableAcquisitionOptions({ slskd: false, ytdlp: false, usenet: false }, NON_ALBUM_CONTEXT).map(
      (o) => o.value
    );
    expect(values).toEqual(["auto"]);
  });

  it("offers slskd only when slskd is enabled", () => {
    const values = getAvailableAcquisitionOptions({ slskd: true, ytdlp: false, usenet: false }, NON_ALBUM_CONTEXT).map(
      (o) => o.value
    );
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
      usenetAllowsSingleTracks: false,
    }).map((o) => o.value);
    expect(values).not.toContain("lidarr");
  });

  it("offers usenet for an album when the source is enabled", () => {
    const values = getAvailableAcquisitionOptions(ALL_ENABLED, ALBUM_NO_LIDARR).map((o) => o.value);
    expect(values).toEqual(["auto", "slskd", "ytdlp", "slskdThenYtdlp", "usenet"]);
  });

  it("omits usenet for a non-album request by default", () => {
    const values = getAvailableAcquisitionOptions(ALL_ENABLED, NON_ALBUM_CONTEXT).map((o) => o.value);
    expect(values).not.toContain("usenet");
  });

  it("offers usenet for a non-album request once single-track requests are opted in", () => {
    const values = getAvailableAcquisitionOptions(ALL_ENABLED, NON_ALBUM_OPTED_IN).map((o) => o.value);
    expect(values).toContain("usenet");
  });

  it("omits usenet when the source is disabled, even for an album", () => {
    const values = getAvailableAcquisitionOptions(BOTH_ENABLED, ALBUM_NO_LIDARR).map((o) => o.value);
    expect(values).not.toContain("usenet");
  });

  it("omits usenet when the source is disabled, even with the opt-in on", () => {
    const values = getAvailableAcquisitionOptions(BOTH_ENABLED, NON_ALBUM_OPTED_IN).map((o) => o.value);
    expect(values).not.toContain("usenet");
  });

  it("orders usenet before lidarr for an album that offers both", () => {
    const values = getAvailableAcquisitionOptions(ALL_ENABLED, {
      isAlbum: true,
      lidarrAvailable: true,
      usenetAllowsSingleTracks: false,
    }).map((o) => o.value);
    expect(values).toEqual(["auto", "slskd", "ytdlp", "slskdThenYtdlp", "usenet", "lidarr"]);
  });
});

describe("offersUsenet", () => {
  it("refuses when the source is disabled", () => {
    expect(offersUsenet({ slskd: true, ytdlp: true, usenet: false }, ALBUM_NO_LIDARR)).toBe(false);
  });

  it("accepts an album request", () => {
    expect(offersUsenet(ALL_ENABLED, ALBUM_NO_LIDARR)).toBe(true);
  });

  it("refuses a non-album request without the opt-in", () => {
    expect(offersUsenet(ALL_ENABLED, NON_ALBUM_CONTEXT)).toBe(false);
  });

  it("accepts a non-album request with the opt-in", () => {
    expect(offersUsenet(ALL_ENABLED, NON_ALBUM_OPTED_IN)).toBe(true);
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

  it("hides slskd-only controls for usenet", () => {
    expect(showsSlskdControls("usenet")).toBe(false);
  });
});

describe("allowsLossless", () => {
  it("allows lossless for sources that can yield a peer-sourced lossless file", () => {
    expect(allowsLossless("auto")).toBe(true);
    expect(allowsLossless("slskd")).toBe(true);
    expect(allowsLossless("slskdThenYtdlp")).toBe(true);
  });

  it("disallows lossless for a YouTube-only source", () => {
    expect(allowsLossless("ytdlp")).toBe(false);
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
      tags: [],
    });
  });

  it("passes the selected tag labels through to the delegate", () => {
    const delegate = buildAlbumDelegate({ ...COMPLETE_SELECTION, tags: ["hi-fi", "favorites"] });
    expect(delegate?.tags).toEqual(["hi-fi", "favorites"]);
  });

  it("preserves the this-album-only scope", () => {
    const delegate = buildAlbumDelegate({ ...COMPLETE_SELECTION, monitor: "album" });
    expect(delegate?.monitor).toBe("album");
  });

  it("preserves each entire-artist scope on the album delegate", () => {
    for (const monitor of ["all", "future", "missing", "none"] as const) {
      const delegate = buildAlbumDelegate({ ...COMPLETE_SELECTION, monitor });
      expect(delegate?.monitor).toBe(monitor);
    }
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
  tags: [],
};

describe("buildArtistDelegate", () => {
  it("builds a delegate payload from a complete selection", () => {
    expect(buildArtistDelegate("Boards of Canada", COMPLETE_ARTIST_SELECTION)).toEqual({
      artistName: "Boards of Canada",
      rootFolderPath: "/music",
      qualityProfileId: 1,
      metadataProfileId: 2,
      monitor: "all",
      tags: [],
    });
  });

  it("passes the selected tag labels through to the delegate", () => {
    const delegate = buildArtistDelegate("Aphex Twin", { ...COMPLETE_ARTIST_SELECTION, tags: ["watched"] });
    expect(delegate?.tags).toEqual(["watched"]);
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

describe("normalizeTag", () => {
  it("trims surrounding whitespace", () => {
    expect(normalizeTag("  hi-fi  ")).toBe("hi-fi");
  });
});

describe("hasTag", () => {
  it("matches case-insensitively", () => {
    expect(hasTag(["Hi-Fi"], "hi-fi")).toBe(true);
  });

  it("returns false when the tag is absent", () => {
    expect(hasTag(["hi-fi"], "favorites")).toBe(false);
  });
});

describe("addTag", () => {
  it("appends a trimmed tag", () => {
    expect(addTag(["hi-fi"], "  favorites  ")).toEqual(["hi-fi", "favorites"]);
  });

  it("ignores an empty or whitespace-only tag and returns the same reference", () => {
    const tags = ["hi-fi"];
    expect(addTag(tags, "   ")).toBe(tags);
  });

  it("ignores a case-insensitive duplicate and returns the same reference", () => {
    const tags = ["Hi-Fi"];
    expect(addTag(tags, "hi-fi")).toBe(tags);
  });
});

describe("removeTag", () => {
  it("removes the exact tag", () => {
    expect(removeTag(["hi-fi", "favorites"], "hi-fi")).toEqual(["favorites"]);
  });
});

describe("filterTagSuggestions", () => {
  it("excludes already selected tags case-insensitively", () => {
    expect(filterTagSuggestions(["Hi-Fi", "favorites"], ["hi-fi"], "")).toEqual(["favorites"]);
  });

  it("matches a substring query case-insensitively", () => {
    expect(filterTagSuggestions(["Hi-Fi", "favorites"], [], "fav")).toEqual(["favorites"]);
  });

  it("returns all unselected suggestions for an empty query", () => {
    expect(filterTagSuggestions(["a", "b"], [], "")).toEqual(["a", "b"]);
  });
});

describe("mapTrackFields", () => {
  it("flattens the track to the request shape", () => {
    const track = createMockTrackFull({
      id: "track-9",
      title: "Nine",
      artists: [{ id: "a", name: "Composer" }],
      track_number: 3,
      disc_number: 1,
      duration_ms: 210000,
      explicit: true,
      isrc: "USABC0000001",
    });
    expect(mapTrackFields(track)).toEqual({
      external_id: "track-9",
      title: "Nine",
      artist: "Composer",
      track_number: 3,
      disc_number: 1,
      duration_ms: 210000,
      explicit: true,
      isrc: "USABC0000001",
    });
  });
});

describe("formatFreeSpace", () => {
  it("returns undefined for non-finite or non-positive values", () => {
    expect(formatFreeSpace(Number.NaN, "free")).toBeUndefined();
    expect(formatFreeSpace(0, "free")).toBeUndefined();
    expect(formatFreeSpace(-5, "free")).toBeUndefined();
  });

  it("rounds to a tenth of a GB below 100 GB", () => {
    expect(formatFreeSpace(5.55 * 1024 ** 3, "free")).toBe("5.6 GB free");
  });

  it("rounds to a whole GB at or above 100 GB", () => {
    expect(formatFreeSpace(123.7 * 1024 ** 3, "free")).toBe("124 GB free");
  });
});

describe("buildRootFolderOptions", () => {
  it("maps each root folder to a labeled option with free space", () => {
    const options = buildRootFolderOptions(
      [
        { path: "/music", freeSpace: 50 * 1024 ** 3, accessible: true, id: 1 },
        { path: "/archive", freeSpace: 0, accessible: true, id: 2 },
      ],
      "free"
    );
    expect(options[0]).toEqual({ value: "/music", label: "/music", description: "50 GB free" });
    expect(options[1].description).toBeUndefined();
  });
});

describe("buildQualityProfileOptions", () => {
  it("maps each profile to a numeric option", () => {
    expect(buildQualityProfileOptions([{ id: 7, name: "Lossless" }])).toEqual([{ value: 7, label: "Lossless" }]);
  });
});

describe("buildMetadataProfileOptions", () => {
  it("maps each profile to a numeric option", () => {
    expect(buildMetadataProfileOptions([{ id: 4, name: "Standard" }])).toEqual([{ value: 4, label: "Standard" }]);
  });
});
