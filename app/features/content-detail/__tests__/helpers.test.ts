import { describe, expect, it } from "vitest";

import type { MusicAlbum, MusicArtist, MusicPlaylist, MusicTrack } from "@api/__generated__/types";

import {
  albumRequestItem,
  albumTarget,
  artistRequestItem,
  artistTarget,
  cardRingFillStyle,
  catalogPlaylistTracks,
  countAlbumsInLibrary,
  detailInitials,
  detailTargetFromMusicItem,
  formatStat,
  isRemovableTrack,
  playlistLibraryTarget,
  playlistOpenItem,
  playlistPreloadedTarget,
  playlistRequestTracks,
  playlistTarget,
  preloadedTrack,
  trackRequestItem,
  visibleFacts,
} from "../helpers";
import type { TracklistTrack } from "../components/Tracklist/types";

function createMusicTrack(overrides?: Partial<MusicTrack>): MusicTrack {
  return {
    type: "track",
    id: "deezer:1",
    title: "Get Lucky",
    artist: "Daft Punk",
    artists: [{ id: "ar1", name: "Daft Punk" }],
    album: { id: "al1", name: "RAM", images: [] },
    duration_ms: 369000,
    track_number: 8,
    disc_number: 1,
    isrc: "US123",
    explicit: false,
    popularity: 90,
    preview_url: null,
    images: [],
    ...overrides,
  };
}

function createTracklistTrack(overrides?: Partial<TracklistTrack>): TracklistTrack {
  return {
    externalId: "t1",
    title: "Get Lucky",
    artist: "Daft Punk",
    durationMs: 369000,
    trackNumber: 8,
    plays: null,
    inLibrary: false,
    requestId: null,
    slskd_request_id: null,
    status: null,
    failureReason: null,
    ...overrides,
  };
}

describe("content-detail helpers", () => {
  describe("detailInitials", () => {
    it("takes the first letter of the first two words", () => {
      expect(detailInitials("Daft Punk")).toBe("DP");
    });

    it("falls back to the first two letters of a single word", () => {
      expect(detailInitials("Adele")).toBe("AD");
    });

    it("returns a placeholder for an empty name", () => {
      expect(detailInitials("   ")).toBe("?");
    });
  });

  describe("formatStat", () => {
    it("renders a dash for a missing value", () => {
      expect(formatStat(null)).toBe("-");
    });

    it("compacts large values instead of writing every digit", () => {
      const formatted = formatStat(1_500_000);
      expect(formatted.length).toBeLessThan("1,500,000".length);
    });
  });

  describe("cardRingFillStyle", () => {
    it("fills the full circle when every track is in library", () => {
      expect(cardRingFillStyle(12, 12)).toEqual({ "--dock-ring-fill": "360deg" });
    });

    it("fills half the circle at half coverage", () => {
      expect(cardRingFillStyle(6, 12)).toEqual({ "--dock-ring-fill": "180deg" });
    });

    it("never exceeds a full circle when the count overshoots", () => {
      expect(cardRingFillStyle(20, 12)).toEqual({ "--dock-ring-fill": "360deg" });
    });

    it("fills nothing when the total is unknown", () => {
      expect(cardRingFillStyle(0, 0)).toEqual({ "--dock-ring-fill": "0deg" });
    });
  });

  describe("countAlbumsInLibrary", () => {
    function createDiscography(
      libraryTrackCounts: { libraryTrackCount: number; totalTracks: number }[]
    ): Parameters<typeof countAlbumsInLibrary>[0] {
      return {
        counts: { album: 0, single: 0, ep: 0, live: 0 },
        groups: [
          {
            recordType: "album",
            albums: libraryTrackCounts.map((entry, index) => ({
              externalId: `al${index}`,
              title: `Album ${index}`,
              image: null,
              totalTracks: entry.totalTracks,
              inLibrary: entry.libraryTrackCount === entry.totalTracks,
              libraryTrackCount: entry.libraryTrackCount,
            })),
          },
        ],
      };
    }

    it("returns null when the discography is undefined", () => {
      expect(countAlbumsInLibrary(undefined)).toBeNull();
    });

    it("counts albums present in the library even when only partially complete", () => {
      const discography = createDiscography([
        { libraryTrackCount: 4, totalTracks: 11 },
        { libraryTrackCount: 3, totalTracks: 14 },
        { libraryTrackCount: 4, totalTracks: 11 },
        { libraryTrackCount: 5, totalTracks: 11 },
      ]);
      expect(countAlbumsInLibrary(discography)).toBe(4);
    });

    it("ignores albums with no tracks in the library", () => {
      const discography = createDiscography([
        { libraryTrackCount: 0, totalTracks: 11 },
        { libraryTrackCount: 2, totalTracks: 11 },
      ]);
      expect(countAlbumsInLibrary(discography)).toBe(1);
    });
  });

  describe("visibleFacts", () => {
    it("drops facts with a null or blank value", () => {
      const facts = visibleFacts([
        { label: "Type", value: "Person" },
        { label: "Country", value: null },
        { label: "Born", value: "   " },
      ]);
      expect(facts).toEqual([{ label: "Type", value: "Person" }]);
    });
  });

  describe("target builders", () => {
    it("builds an album target that mirrors the artist name", () => {
      expect(albumTarget({ id: "1", name: "RAM", artistName: "Daft Punk", cover: null })).toEqual({
        mode: "album",
        id: "1",
        name: "RAM",
        artistName: "Daft Punk",
        cover: null,
      });
    });

    it("builds an artist target whose artistName equals its name", () => {
      const target = artistTarget({ id: "2", name: "Adele", cover: null });
      expect(target.mode).toBe("artist");
      expect(target.artistName).toBe("Adele");
    });

    it("builds a playlist target carrying the library playlist id", () => {
      const target = playlistTarget({ id: "pl1", name: "Road Trip", cover: "c.jpg" });
      expect(target.mode).toBe("playlist");
      expect(target.id).toBe("pl1");
      expect(target.cover).toBe("c.jpg");
    });
  });

  describe("detailTargetFromMusicItem", () => {
    it("maps an album item to an album target with its first artist", () => {
      const album: MusicAlbum = {
        type: "album",
        id: "al1",
        name: "RAM",
        artist: "Daft Punk",
        artists: [{ id: "ar1", name: "Daft Punk" }],
        images: [{ url: "cover.jpg", width: null, height: null }],
        release_date: "2013",
        total_tracks: 13,
        genres: [],
        label: null,
        upc: null,
        tracks: [],
      };
      expect(detailTargetFromMusicItem(album)).toEqual({
        mode: "album",
        id: "al1",
        name: "RAM",
        artistName: "Daft Punk",
        cover: "cover.jpg",
      });
    });

    it("maps an artist item to an artist target", () => {
      const artist: MusicArtist = {
        type: "artist",
        id: "ar1",
        name: "Adele",
        images: [],
        genres: [],
        followers: null,
      };
      const target = detailTargetFromMusicItem(artist);
      expect(target?.mode).toBe("artist");
      expect(target?.cover).toBeNull();
    });

    it("maps a playlist item to a catalog-source playlist target", () => {
      const playlist: MusicPlaylist = {
        type: "playlist",
        id: "pl1",
        name: "Road Trip",
        description: null,
        images: [{ url: "cover.jpg", width: null, height: null }],
        owner: { id: "", name: "" },
        total_tracks: 20,
        tracks: [],
      };
      expect(detailTargetFromMusicItem(playlist)).toEqual({
        mode: "playlist",
        id: "pl1",
        name: "Road Trip",
        artistName: "Road Trip",
        cover: "cover.jpg",
        playlistSource: "catalog",
      });
    });
  });

  describe("preloaded playlist builders", () => {
    it("maps a catalog track to a requestable tracklist row with null status", () => {
      const row = preloadedTrack(createMusicTrack());
      expect(row).toEqual({
        externalId: "deezer:1",
        title: "Get Lucky",
        artist: "Daft Punk",
        durationMs: 369000,
        trackNumber: 8,
        plays: null,
        inLibrary: false,
        requestId: null,
        slskd_request_id: null,
        status: null,
        failureReason: null,
      });
    });

    it("falls back to the flat artist string when artists is empty", () => {
      const row = preloadedTrack(createMusicTrack({ artists: [], artist: "Justice" }));
      expect(row.artist).toBe("Justice");
    });

    it("builds a preloaded playlist target carrying its mapped tracks and disabled-request guard", () => {
      const target = playlistPreloadedTarget({
        id: "discovery:listenbrainz:weekly-jams:2026",
        name: "Weekly Jams",
        cover: "c.jpg",
        tracks: [createMusicTrack({ id: "a" }), createMusicTrack({ id: "b" })],
        requestDisabled: true,
        requestDisabledTooltip: "Auto-request is on",
      });
      expect(target.mode).toBe("playlist");
      expect(target.id).toBe("discovery:listenbrainz:weekly-jams:2026");
      expect(target.preloadedTracks).toHaveLength(2);
      expect(target.preloadedTracks?.[0].externalId).toBe("a");
      expect(target.preloadedTracks?.[0].status).toBeNull();
      expect(target.requestDisabled).toBe(true);
      expect(target.requestDisabledTooltip).toBe("Auto-request is on");
    });
  });

  describe("playlist source discriminator", () => {
    it("marks a catalog playlist target with the catalog source", () => {
      const target = playlistTarget({ id: "deezer:pl", name: "Hits", cover: "c.jpg" });
      expect(target.playlistSource).toBe("catalog");
    });

    it("marks a library playlist target with the library source", () => {
      const target = playlistLibraryTarget({ id: "cuid123", name: "My Mix", cover: null });
      expect(target.playlistSource).toBe("library");
      expect(target.preloadedTracks).toBeUndefined();
    });

    it("marks a preloaded playlist target with the preloaded source", () => {
      const target = playlistPreloadedTarget({
        id: "discovery:mix",
        name: "Weekly",
        cover: null,
        tracks: [createMusicTrack({ id: "a" })],
      });
      expect(target.playlistSource).toBe("preloaded");
    });

    it("maps catalog playlist content entries to requestable tracklist rows with null status", () => {
      const rows = catalogPlaylistTracks([
        { added_at: null, track: createMusicTrack({ id: "a", title: "One" }) },
        { added_at: null, track: createMusicTrack({ id: "b", title: "Two" }) },
      ]);
      expect(rows).toHaveLength(2);
      expect(rows[0].externalId).toBe("a");
      expect(rows[0].status).toBeNull();
      expect(rows[0].inLibrary).toBe(false);
    });

    it("returns an empty array for undefined catalog content", () => {
      expect(catalogPlaylistTracks(undefined)).toEqual([]);
    });
  });

  describe("request item builders", () => {
    it("builds an album MusicItem carrying the cover image", () => {
      const item = albumRequestItem({ id: "al1", name: "RAM", artistName: "Daft Punk", cover: "c.jpg" });
      expect(item.type).toBe("album");
      expect(item.images[0]?.url).toBe("c.jpg");
      expect(item.artists[0]?.name).toBe("Daft Punk");
    });

    it("builds an artist MusicItem for the lidarr delegate path", () => {
      const item = artistRequestItem({ id: "ar1", name: "Adele" });
      expect(item.type).toBe("artist");
      expect(item.name).toBe("Adele");
    });

    it("builds a track MusicItem that carries album context when provided", () => {
      const item = trackRequestItem({
        id: "t1",
        title: "Get Lucky",
        artistName: "Daft Punk",
        durationMs: 369000,
        trackNumber: 8,
        isrc: null,
        album: { id: "al1", name: "RAM", cover: "c.jpg" },
      });
      expect(item.type).toBe("track");
      expect(item.album.id).toBe("al1");
      expect(item.album.images[0]?.url).toBe("c.jpg");
    });

    it("builds a track MusicItem with an empty album when context is absent", () => {
      const item = trackRequestItem({
        id: "t1",
        title: "Get Lucky",
        artistName: "Daft Punk",
        durationMs: 369000,
        trackNumber: 8,
        isrc: null,
      });
      expect(item.album.id).toBe("");
      expect(item.album.images).toEqual([]);
    });

    it("builds a playlist open MusicItem with empty tracks for the detail flow", () => {
      const item = playlistOpenItem({ id: "pl1", name: "Road Trip", cover: "c.jpg", totalTracks: 20 });
      expect(item.type).toBe("playlist");
      expect(item.id).toBe("pl1");
      expect(item.total_tracks).toBe(20);
      expect(item.images[0]?.url).toBe("c.jpg");
      expect(item.tracks).toEqual([]);
    });

    it("maps tracklist tracks to MusicTracks for the config modal", () => {
      const tracks = playlistRequestTracks([
        createTracklistTrack({ externalId: "a" }),
        createTracklistTrack({ externalId: "b" }),
      ]);
      expect(tracks).toHaveLength(2);
      expect(tracks[0].type).toBe("track");
      expect(tracks[0].id).toBe("a");
      expect(tracks[0].artist).toBe("Daft Punk");
      expect(tracks[0].artists[0]?.name).toBe("Daft Punk");
      expect(tracks[0].album.id).toBe("");
    });
  });

  describe("isRemovableTrack", () => {
    it("treats a complete track with a requestId as removable", () => {
      expect(isRemovableTrack(createTracklistTrack({ requestId: "r1", status: "complete" }))).toBe(true);
    });

    it("treats a failed track with a requestId as removable", () => {
      expect(isRemovableTrack(createTracklistTrack({ requestId: "r1", status: "failed" }))).toBe(true);
    });

    it("rejects in-flight statuses", () => {
      expect(isRemovableTrack(createTracklistTrack({ requestId: "r1", status: "downloading" }))).toBe(false);
      expect(isRemovableTrack(createTracklistTrack({ requestId: "r1", status: "queued" }))).toBe(false);
      expect(isRemovableTrack(createTracklistTrack({ requestId: "r1", status: "importing" }))).toBe(false);
    });

    it("rejects a track with no requestId even when complete", () => {
      expect(isRemovableTrack(createTracklistTrack({ requestId: null, status: "complete" }))).toBe(false);
    });

    it("rejects a track with no status (catalog/preloaded)", () => {
      expect(isRemovableTrack(createTracklistTrack({ requestId: "r1", status: null }))).toBe(false);
    });
  });
});
