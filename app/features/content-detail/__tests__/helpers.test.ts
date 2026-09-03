import type { TFunction } from "i18next";
import { describe, expect, it } from "vitest";

import type { MusicAlbum, MusicArtist, MusicPlaylist, MusicTrack } from "@api/__generated__/types";

import {
  albumRequestItem,
  albumTarget,
  artistRequestItem,
  artistTarget,
  cardRingFillStyle,
  catalogPlaylistTracks,
  collectDegradedSources,
  computeRequestState,
  countAlbumsInLibrary,
  deriveTrackStatusCounts,
  detailInitials,
  detailTargetFromMusicItem,
  formatPlays,
  formatStat,
  humanizeArtistType,
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

const typeLabels: Record<string, string> = {
  "details.typeValue.soloArtist": "Solo artist",
  "details.typeValue.band": "Band",
};

function fakeContentDetailT(key: string): string {
  return typeLabels[key] ?? key;
}

const contentDetailT = fakeContentDetailT as unknown as TFunction<"contentDetail">;

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
    album: { externalId: "al1", name: "RAM", cover: null },
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

  describe("formatPlays", () => {
    it("renders a dash for a missing value", () => {
      expect(formatPlays(null)).toBe("-");
    });

    it("floors to the nearest hundred-thousand with a plus suffix", () => {
      expect(formatPlays(404_100)).toBe("400K+");
      expect(formatPlays(392_200)).toBe("300K+");
      expect(formatPlays(316_100)).toBe("300K+");
    });

    it("floors to whole millions without a plus suffix", () => {
      expect(formatPlays(1_000_000)).toBe("1M");
      expect(formatPlays(2_900_000)).toBe("2M");
    });

    it("falls back to the compact format below one hundred thousand", () => {
      expect(formatPlays(66_700)).not.toContain("0K+");
      expect(formatPlays(66_700)).not.toBe("-");
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

  describe("computeRequestState", () => {
    it("returns request when nothing has been requested yet", () => {
      expect(
        computeRequestState({
          requestedTrackCount: 0,
          failedTrackCount: 0,
          libraryTrackCount: 0,
          totalTracks: 12,
        })
      ).toBe("request");
    });

    it("returns inLibrary while every requested track is still in progress", () => {
      expect(
        computeRequestState({
          requestedTrackCount: 12,
          failedTrackCount: 0,
          libraryTrackCount: 0,
          totalTracks: 12,
        })
      ).toBe("inLibrary");
    });

    it("returns requestMissing once it settles with failures and nothing in flight", () => {
      expect(
        computeRequestState({
          requestedTrackCount: 9,
          failedTrackCount: 3,
          libraryTrackCount: 9,
          totalTracks: 12,
        })
      ).toBe("requestMissing");
    });

    it("returns inLibrary when every track is complete", () => {
      expect(
        computeRequestState({
          requestedTrackCount: 12,
          failedTrackCount: 0,
          libraryTrackCount: 12,
          totalTracks: 12,
        })
      ).toBe("inLibrary");
    });

    it("returns inLibrary while some are complete and the rest are still in flight", () => {
      expect(
        computeRequestState({
          requestedTrackCount: 12,
          failedTrackCount: 0,
          libraryTrackCount: 5,
          totalTracks: 12,
        })
      ).toBe("inLibrary");
    });

    it("returns inLibrary when failures coexist with in-flight tracks", () => {
      expect(
        computeRequestState({
          requestedTrackCount: 8,
          failedTrackCount: 2,
          libraryTrackCount: 5,
          totalTracks: 12,
        })
      ).toBe("inLibrary");
    });

    it("returns request when nothing has been attempted on a fresh album", () => {
      expect(
        computeRequestState({
          requestedTrackCount: 0,
          failedTrackCount: 0,
          libraryTrackCount: 0,
          totalTracks: 9,
        })
      ).toBe("request");
    });

    it("returns requestMissing when settled with never-requested gaps and no failures", () => {
      expect(
        computeRequestState({
          requestedTrackCount: 5,
          failedTrackCount: 0,
          libraryTrackCount: 5,
          totalTracks: 9,
        })
      ).toBe("requestMissing");
    });

    it("returns inLibrary when every track of a partial album is complete", () => {
      expect(
        computeRequestState({
          requestedTrackCount: 9,
          failedTrackCount: 0,
          libraryTrackCount: 9,
          totalTracks: 9,
        })
      ).toBe("inLibrary");
    });

    it("returns inLibrary while some are complete and the remainder are in flight", () => {
      expect(
        computeRequestState({
          requestedTrackCount: 9,
          failedTrackCount: 0,
          libraryTrackCount: 5,
          totalTracks: 9,
        })
      ).toBe("inLibrary");
    });

    it("returns requestMissing when settled with some complete and the rest failed", () => {
      expect(
        computeRequestState({
          requestedTrackCount: 5,
          failedTrackCount: 4,
          libraryTrackCount: 5,
          totalTracks: 9,
        })
      ).toBe("requestMissing");
    });

    it("returns requestMissing when every attempted track failed", () => {
      expect(
        computeRequestState({
          requestedTrackCount: 0,
          failedTrackCount: 9,
          libraryTrackCount: 0,
          totalTracks: 9,
        })
      ).toBe("requestMissing");
    });
  });

  describe("deriveTrackStatusCounts", () => {
    it("counts a settled album with one failed track and feeds requestMissing", () => {
      const tracks = [
        ...Array.from({ length: 21 }, () => createTracklistTrack({ status: "complete" })),
        createTracklistTrack({ status: "failed" }),
      ];
      const counts = deriveTrackStatusCounts(tracks);
      expect(counts).toEqual({ completeCount: 21, failedCount: 1, requestedCount: 21 });
      expect(
        computeRequestState({
          requestedTrackCount: counts.requestedCount,
          failedTrackCount: counts.failedCount,
          libraryTrackCount: counts.completeCount,
          totalTracks: tracks.length,
        })
      ).toBe("requestMissing");
    });

    it("counts an all-complete album and feeds inLibrary", () => {
      const tracks = Array.from({ length: 12 }, () => createTracklistTrack({ status: "complete" }));
      const counts = deriveTrackStatusCounts(tracks);
      expect(counts).toEqual({ completeCount: 12, failedCount: 0, requestedCount: 12 });
      expect(
        computeRequestState({
          requestedTrackCount: counts.requestedCount,
          failedTrackCount: counts.failedCount,
          libraryTrackCount: counts.completeCount,
          totalTracks: tracks.length,
        })
      ).toBe("inLibrary");
    });

    it("counts a catalog tracklist with null statuses and feeds request", () => {
      const tracks = Array.from({ length: 10 }, () => createTracklistTrack({ status: null }));
      const counts = deriveTrackStatusCounts(tracks);
      expect(counts).toEqual({ completeCount: 0, failedCount: 0, requestedCount: 0 });
      expect(
        computeRequestState({
          requestedTrackCount: counts.requestedCount,
          failedTrackCount: counts.failedCount,
          libraryTrackCount: counts.completeCount,
          totalTracks: tracks.length,
        })
      ).toBe("request");
    });

    it("counts in-flight tracks as requested but not complete or failed", () => {
      const tracks = [
        createTracklistTrack({ status: "downloading" }),
        createTracklistTrack({ status: "queued" }),
        createTracklistTrack({ status: "complete" }),
        createTracklistTrack({ status: "failed" }),
      ];
      expect(deriveTrackStatusCounts(tracks)).toEqual({
        completeCount: 1,
        failedCount: 1,
        requestedCount: 3,
      });
    });

    it("excludes cancelled tracks from the requested count", () => {
      const tracks = [createTracklistTrack({ status: "cancelled" }), createTracklistTrack({ status: "complete" })];
      expect(deriveTrackStatusCounts(tracks)).toEqual({
        completeCount: 1,
        failedCount: 0,
        requestedCount: 1,
      });
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
        album: { externalId: "al1", name: "RAM", cover: null },
        inLibrary: false,
        requestId: null,
        slskd_request_id: null,
        status: null,
        failureReason: null,
      });
    });

    it("carries the catalog album through to the row so a request can identify it", () => {
      const row = preloadedTrack(
        createMusicTrack({
          album: { id: "al9", name: "Discovery", images: [{ url: "c.jpg", width: 500, height: 500 }] },
        })
      );
      expect(row.album).toEqual({ externalId: "al9", name: "Discovery", cover: "c.jpg" });
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

    it("builds an artist MusicItem carrying the cover image for the lidarr delegate path", () => {
      const item = artistRequestItem({ id: "ar1", name: "Adele", cover: "photo.jpg" });
      expect(item.type).toBe("artist");
      expect(item.name).toBe("Adele");
      expect(item.images[0]?.url).toBe("photo.jpg");
    });

    it("builds an artist MusicItem with no images when cover is null", () => {
      const item = artistRequestItem({ id: "ar1", name: "Adele", cover: null });
      expect(item.images).toHaveLength(0);
    });

    it("builds a track MusicItem that carries album context when provided", () => {
      const item = trackRequestItem({
        id: "t1",
        title: "Get Lucky",
        artistName: "Daft Punk",
        durationMs: 369000,
        trackNumber: 8,
        isrc: null,
        album: { externalId: "al1", name: "RAM", cover: "c.jpg" },
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
      expect(tracks[0].album.id).toBe("al1");
    });

    it("carries each row's album into the MusicTrack so the modal can identify it", () => {
      const tracks = playlistRequestTracks([
        createTracklistTrack({ externalId: "a", album: { externalId: "al9", name: "Homework", cover: "c.jpg" } }),
      ]);
      expect(tracks[0].album.id).toBe("al9");
      expect(tracks[0].album.name).toBe("Homework");
      expect(tracks[0].album.images[0]?.url).toBe("c.jpg");
    });

    it("leaves the album empty when the row genuinely has none, rather than inventing an id", () => {
      const tracks = playlistRequestTracks([createTracklistTrack({ externalId: "a", album: null })]);
      expect(tracks[0].album.id).toBe("");
      expect(tracks[0].album.images).toEqual([]);
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

  describe("humanizeArtistType", () => {
    it("maps the human instance-of token to the solo artist label", () => {
      expect(humanizeArtistType("human", contentDetailT)).toBe("Solo artist");
    });

    it("maps the musical group instance-of token to the band label", () => {
      expect(humanizeArtistType("musical group", contentDetailT)).toBe("Band");
    });

    it("matches the known tokens case-insensitively and trims surrounding whitespace", () => {
      expect(humanizeArtistType("Human", contentDetailT)).toBe("Solo artist");
      expect(humanizeArtistType("  MUSICAL GROUP  ", contentDetailT)).toBe("Band");
    });

    it("capitalizes an unknown raw type instead of localizing it", () => {
      expect(humanizeArtistType("duo", contentDetailT)).toBe("Duo");
    });

    it("returns null for null, empty, or whitespace-only values", () => {
      expect(humanizeArtistType(null, contentDetailT)).toBeNull();
      expect(humanizeArtistType("", contentDetailT)).toBeNull();
      expect(humanizeArtistType("   ", contentDetailT)).toBeNull();
    });
  });

  describe("collectDegradedSources", () => {
    it("collects sources from a single query result", () => {
      expect(collectDegradedSources([[{ source: "lastfm", unavailableForSeconds: 60 }]])).toEqual([
        { source: "lastfm", unavailableForSeconds: 60 },
      ]);
    });

    it("dedupes sources repeated across query results and sorts them", () => {
      expect(
        collectDegradedSources([
          [
            { source: "wikidata", unavailableForSeconds: null },
            { source: "lastfm", unavailableForSeconds: null },
          ],
          [
            { source: "lastfm", unavailableForSeconds: null },
            { source: "discogs", unavailableForSeconds: null },
          ],
        ])
      ).toEqual([
        { source: "discogs", unavailableForSeconds: null },
        { source: "lastfm", unavailableForSeconds: null },
        { source: "wikidata", unavailableForSeconds: null },
      ]);
    });

    it("keeps the longest reported outage when a source repeats", () => {
      expect(
        collectDegradedSources([
          [{ source: "lastfm", unavailableForSeconds: null }],
          [{ source: "lastfm", unavailableForSeconds: 120 }],
          [{ source: "lastfm", unavailableForSeconds: 90 }],
        ])
      ).toEqual([{ source: "lastfm", unavailableForSeconds: 120 }]);
    });

    it("ignores missing degraded fields", () => {
      expect(
        collectDegradedSources([undefined, [{ source: "musicbrainz", unavailableForSeconds: 5 }], undefined])
      ).toEqual([{ source: "musicbrainz", unavailableForSeconds: 5 }]);
    });

    it("returns an empty list when nothing degraded", () => {
      expect(collectDegradedSources([undefined, [], undefined])).toEqual([]);
    });
  });
});
