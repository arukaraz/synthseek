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
  defaultSelection,
  getItemDisplayName,
  moveSource,
  offeredSources,
  reconcileSelection,
  toggleSource,
  usesSlskd,
  hasTag,
  isAlbum,
  isLastActiveSource,
  isLidarrSelectionComplete,
  isTrack,
  mapTrackFields,
  normalizeTag,
  removeTag,
} from "../helpers";
import { createMockTrackFull, createMockAlbumSimplified, createMockPlaylistSimplified } from "@test/factories";
import type { LidarrArtistSelection, LidarrSelection } from "../types";

const ALL_ENABLED = { slskd: true, ytdlp: true, usenet: true };
const NON_ALBUM_CONTEXT = { isAlbum: false, usenetAllowsSingleTracks: false };
const ALBUM_CONTEXT = { isAlbum: true, usenetAllowsSingleTracks: false };
const NON_ALBUM_OPTED_IN = { isAlbum: false, usenetAllowsSingleTracks: true };

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

describe("offeredSources", () => {
  it("keeps the canonical priority order regardless of the enabled map order", () => {
    expect(offeredSources(ALL_ENABLED, ALBUM_CONTEXT)).toEqual(["slskd", "usenet", "ytdlp"]);
  });

  it("drops a disabled source", () => {
    expect(offeredSources({ slskd: true, ytdlp: false, usenet: true }, ALBUM_CONTEXT)).toEqual(["slskd", "usenet"]);
  });

  it("withholds usenet from a non-album request by default", () => {
    expect(offeredSources(ALL_ENABLED, NON_ALBUM_CONTEXT)).toEqual(["slskd", "ytdlp"]);
  });

  it("offers usenet outside albums once the opt-in is on", () => {
    expect(offeredSources(ALL_ENABLED, NON_ALBUM_OPTED_IN)).toContain("usenet");
  });
});

describe("defaultSelection", () => {
  it("starts on automatic with every offered source active", () => {
    expect(defaultSelection(["slskd", "usenet"])).toEqual({
      mode: "auto",
      order: ["slskd", "usenet"],
      active: ["slskd", "usenet"],
    });
  });
});

describe("reconcileSelection", () => {
  const manual = { mode: "manual" as const, order: ["ytdlp", "slskd"] as const, active: ["ytdlp"] as const };

  it("keeps the order the user arranged", () => {
    const next = reconcileSelection(
      { ...manual, order: ["ytdlp", "slskd"], active: ["ytdlp"] },
      ["slskd", "ytdlp"],
      false
    );
    expect(next.order).toEqual(["ytdlp", "slskd"]);
  });

  it("appends a source that became available without disturbing the arranged ones", () => {
    const next = reconcileSelection(
      { mode: "manual", order: ["ytdlp", "slskd"], active: ["ytdlp"] },
      ["slskd", "ytdlp", "usenet"],
      false
    );
    expect(next.order).toEqual(["ytdlp", "slskd", "usenet"]);
    expect(next.active).toContain("usenet");
  });

  it("drops a source that stopped being offered", () => {
    const next = reconcileSelection(
      { mode: "manual", order: ["ytdlp", "usenet", "slskd"], active: ["usenet"] },
      ["slskd", "ytdlp"],
      false
    );
    expect(next.order).toEqual(["ytdlp", "slskd"]);
    expect(next.active).not.toContain("usenet");
  });

  it("leaves a deselected source deselected", () => {
    const next = reconcileSelection(
      { mode: "manual", order: ["slskd", "ytdlp"], active: ["slskd"] },
      ["slskd", "ytdlp"],
      false
    );
    expect(next.active).toEqual(["slskd"]);
  });

  it("falls back to automatic when lidarr stops being available", () => {
    const next = reconcileSelection({ mode: "lidarr", order: ["slskd"], active: ["slskd"] }, ["slskd"], false);
    expect(next.mode).toBe("auto");
  });

  it("keeps the lidarr mode while lidarr is still available", () => {
    const next = reconcileSelection({ mode: "lidarr", order: ["slskd"], active: ["slskd"] }, ["slskd"], true);
    expect(next.mode).toBe("lidarr");
  });
});

describe("moveSource", () => {
  const selection = { mode: "manual" as const, order: ["slskd", "usenet", "ytdlp"], active: ["slskd"] };

  it("moves a source up", () => {
    expect(moveSource(selection, "usenet", -1).order).toEqual(["usenet", "slskd", "ytdlp"]);
  });

  it("moves a source down", () => {
    expect(moveSource(selection, "usenet", 1).order).toEqual(["slskd", "ytdlp", "usenet"]);
  });

  it("refuses to move the first one up", () => {
    expect(moveSource(selection, "slskd", -1)).toBe(selection);
  });

  it("refuses to move the last one down", () => {
    expect(moveSource(selection, "ytdlp", 1)).toBe(selection);
  });

  it("does not change which sources are active", () => {
    expect(moveSource(selection, "usenet", -1).active).toEqual(["slskd"]);
  });
});

describe("toggleSource", () => {
  const selection = { mode: "manual" as const, order: ["slskd", "ytdlp"], active: ["slskd"] };

  it("activates an inactive source", () => {
    expect(toggleSource(selection, "ytdlp").active).toEqual(["slskd", "ytdlp"]);
  });

  it("deactivates an active source while another one remains", () => {
    const both = { ...selection, active: ["slskd", "ytdlp"] };
    expect(toggleSource(both, "slskd").active).toEqual(["ytdlp"]);
  });

  it("never changes the order, so a deselected source keeps its place", () => {
    const both = { ...selection, active: ["slskd", "ytdlp"] };
    expect(toggleSource(both, "slskd").order).toEqual(["slskd", "ytdlp"]);
  });

  it("refuses to deselect the last source, so a manual request never silently uses every source", () => {
    expect(toggleSource(selection, "slskd")).toBe(selection);
    expect(buildSourceChain(toggleSource(selection, "slskd"))).toEqual(["slskd"]);
  });

  it("reports which source is the last one standing, so the checkbox can say why it is locked", () => {
    expect(isLastActiveSource(selection, "slskd")).toBe(true);
    expect(isLastActiveSource(selection, "ytdlp")).toBe(false);
    expect(isLastActiveSource({ ...selection, active: ["slskd", "ytdlp"] }, "slskd")).toBe(false);
  });
});

describe("buildSourceChain", () => {
  it("sends nothing on automatic, so the server order applies", () => {
    expect(buildSourceChain({ mode: "auto", order: ["slskd", "ytdlp"], active: ["slskd"] })).toBeUndefined();
  });

  it("sends nothing for lidarr", () => {
    expect(buildSourceChain({ mode: "lidarr", order: ["slskd"], active: ["slskd"] })).toBeUndefined();
  });

  it("sends the active sources in the arranged order", () => {
    expect(
      buildSourceChain({ mode: "manual", order: ["usenet", "slskd", "ytdlp"], active: ["slskd", "usenet"] })
    ).toEqual(["usenet", "slskd"]);
  });

  it("sends nothing when the user deselected everything", () => {
    expect(buildSourceChain({ mode: "manual", order: ["slskd", "ytdlp"], active: [] })).toBeUndefined();
  });
});

describe("usesSlskd", () => {
  it("assumes slskd on automatic, since the server order may reach it", () => {
    expect(usesSlskd({ mode: "auto", order: ["ytdlp"], active: ["ytdlp"] })).toBe(true);
  });

  it("is false for lidarr", () => {
    expect(usesSlskd({ mode: "lidarr", order: ["slskd"], active: ["slskd"] })).toBe(false);
  });

  it("follows the active set on manual", () => {
    expect(usesSlskd({ mode: "manual", order: ["slskd", "ytdlp"], active: ["slskd"] })).toBe(true);
    expect(usesSlskd({ mode: "manual", order: ["slskd", "ytdlp"], active: ["ytdlp"] })).toBe(false);
  });
});

describe("allowsLossless", () => {
  it("tracks whether slskd is in play", () => {
    expect(allowsLossless({ mode: "manual", order: ["slskd"], active: ["slskd"] })).toBe(true);
    expect(allowsLossless({ mode: "manual", order: ["ytdlp"], active: ["ytdlp"] })).toBe(false);
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
