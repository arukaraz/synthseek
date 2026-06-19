import { describe, expect, it } from "vitest";

import type { FeedCandidate } from "../types";
import { describeEmptyReason, formatFreshness, synthesizePlaylist, synthesizeTrack, tileGradient } from "../helpers";
import { LB_KIND_METADATA } from "../constants";

function candidate(overrides: Partial<FeedCandidate> = {}): FeedCandidate {
  return {
    catalogTrackId: "deezer:1",
    title: "Tití Me Preguntó",
    artist: "Bad Bunny",
    albumExternalId: "deezer:album:1",
    albumName: "Un Verano Sin Ti",
    albumArtist: "Bad Bunny",
    albumImage: "https://cover/1.jpg",
    isrc: "USX000",
    durationMs: 240000,
    trackNumber: 3,
    discNumber: 1,
    explicit: true,
    popularity: 88,
    rank: 1,
    ...overrides,
  };
}

const DAY = 86_400_000;
const NOW = new Date("2026-05-29T12:00:00.000Z").getTime();

describe("synthesizeTrack", () => {
  it("maps every MusicTrack field from the candidate", () => {
    const track = synthesizeTrack(candidate());
    expect(track).toMatchObject({
      type: "track",
      id: "deezer:1",
      title: "Tití Me Preguntó",
      artist: "Bad Bunny",
      duration_ms: 240000,
      track_number: 3,
      disc_number: 1,
      isrc: "USX000",
      explicit: true,
      popularity: 88,
      preview_url: null,
    });
    expect(track.album).toEqual({
      id: "deezer:album:1",
      name: "Un Verano Sin Ti",
      images: [{ url: "https://cover/1.jpg", width: null, height: null }],
    });
    expect(track.artists).toEqual([{ id: "deezer:1:artist", name: "Bad Bunny" }]);
  });

  it("yields empty image arrays when albumImage is null", () => {
    const track = synthesizeTrack(candidate({ albumImage: null, isrc: null }));
    expect(track.images).toEqual([]);
    expect(track.album.images).toEqual([]);
    expect(track.isrc).toBeNull();
  });
});

describe("synthesizePlaylist", () => {
  const meta = LB_KIND_METADATA["weekly-exploration"];

  it("builds a stable external_id from generatedAt and a human name", () => {
    const mix = {
      kind: "weekly-exploration" as const,
      status: "ready" as const,
      candidates: [candidate()],
      generatedAt: "2026-05-25T07:00:00.000Z",
    };
    const tracks = mix.candidates.map(synthesizeTrack);
    const playlist = synthesizePlaylist(mix, meta, tracks);
    expect(playlist.id).toBe("discovery:listenbrainz:weekly-exploration:2026-05-25T07:00:00.000Z");
    expect(playlist.name).toBe("Weekly Exploration (May 25 2026)");
    expect(playlist.total_tracks).toBe(1);
    expect(playlist.tracks).toEqual([]);
    expect(playlist.owner).toEqual({ id: "discovery", name: "ListenBrainz" });
  });

  it("is deterministic across calls for the same generatedAt", () => {
    const mix = {
      kind: "weekly-jams" as const,
      status: "ready" as const,
      candidates: [candidate()],
      generatedAt: "2026-05-25T07:00:00.000Z",
    };
    const a = synthesizePlaylist(mix, LB_KIND_METADATA["weekly-jams"], []);
    const b = synthesizePlaylist(mix, LB_KIND_METADATA["weekly-jams"], []);
    expect(a.id).toBe(b.id);
  });

  it("falls back to 'unsynced' when generatedAt is absent", () => {
    const mix = { kind: "daily-jams" as const, status: "ready" as const, candidates: [] };
    const playlist = synthesizePlaylist(mix, LB_KIND_METADATA["daily-jams"], []);
    expect(playlist.id).toBe("discovery:listenbrainz:daily-jams:unsynced");
  });

  it("prefers a non-empty custom name over the default meta label", () => {
    const mix = {
      kind: "cf-recommendations" as const,
      status: "ready" as const,
      candidates: [candidate()],
      generatedAt: "2026-05-25T07:00:00.000Z",
    };
    const playlist = synthesizePlaylist(mix, LB_KIND_METADATA["cf-recommendations"], [], "My Daily Picks");
    expect(playlist.name).toBe("My Daily Picks (May 25 2026)");
  });

  it("falls back to the default label when the custom name is empty or whitespace", () => {
    const mix = {
      kind: "cf-recommendations" as const,
      status: "ready" as const,
      candidates: [candidate()],
      generatedAt: "2026-05-25T07:00:00.000Z",
    };
    const playlist = synthesizePlaylist(mix, LB_KIND_METADATA["cf-recommendations"], [], "   ");
    expect(playlist.name).toBe("CF Recommendations (May 25 2026)");
  });
});

describe("formatFreshness", () => {
  it("returns null when generatedAt is undefined", () => {
    expect(formatFreshness(undefined, "weekly-jams", NOW)).toBeNull();
  });

  it("uses 'Updated today' for daily-jams generated today", () => {
    expect(formatFreshness(new Date(NOW).toISOString(), "daily-jams", NOW)).toBe("Updated today");
  });

  it("uses 'Updated Nd ago' for daily-jams in the past", () => {
    expect(formatFreshness(new Date(NOW - 2 * DAY).toISOString(), "daily-jams", NOW)).toBe("Updated 2d ago");
  });

  it("uses 'Synced Nd ago' for cf-recommendations", () => {
    expect(formatFreshness(new Date(NOW - 2 * DAY).toISOString(), "cf-recommendations", NOW)).toBe("Synced 2d ago");
  });

  it("uses a weekday for weekly feeds within the week", () => {
    const result = formatFreshness(new Date(NOW - 3 * DAY).toISOString(), "weekly-exploration", NOW);
    expect(result).toMatch(/^Updated [A-Z][a-z]{2}$/);
  });

  it("falls back to Nd ago for weekly feeds older than a week", () => {
    expect(formatFreshness(new Date(NOW - 10 * DAY).toISOString(), "weekly-jams", NOW)).toBe("Updated 10d ago");
  });
});

describe("describeEmptyReason", () => {
  it("returns the first-sync label for status none", () => {
    expect(describeEmptyReason({ kind: "weekly-jams", status: "none", candidates: [] })).toBe(
      "Waiting for the first ListenBrainz sync."
    );
  });

  it("explains an upstream fetch error for fetch-error", () => {
    expect(
      describeEmptyReason({ kind: "weekly-jams", status: "empty", candidates: [], emptyReason: "fetch-error" })
    ).toBe("Couldn't reach ListenBrainz. It will retry on the next sync.");
  });

  it("explains upstream generation for playlist-not-generated-yet", () => {
    expect(
      describeEmptyReason({
        kind: "daily-jams",
        status: "empty",
        candidates: [],
        emptyReason: "playlist-not-generated-yet",
      })
    ).toBe("ListenBrainz hasn't built this mix yet. It appears once your listening history is enough to generate it.");
  });

  it("explains no collaborative recommendations for no-data", () => {
    expect(
      describeEmptyReason({ kind: "cf-recommendations", status: "empty", candidates: [], emptyReason: "no-data" })
    ).toBe("ListenBrainz hasn't computed collaborative recommendations for your account yet.");
  });

  it("falls back to the feed-empty label for unknown reasons", () => {
    expect(describeEmptyReason({ kind: "weekly-jams", status: "empty", candidates: [], emptyReason: "weird" })).toBe(
      "ListenBrainz returned no songs for this mix yet."
    );
  });
});

describe("tileGradient", () => {
  it("is deterministic for the same seed", () => {
    expect(tileGradient("daily-jams")).toBe(tileGradient("daily-jams"));
  });

  it("differs across seeds", () => {
    expect(tileGradient("daily-jams")).not.toBe(tileGradient("cf-recommendations"));
  });

  it("produces an oklch linear-gradient", () => {
    expect(tileGradient("x")).toMatch(/^linear-gradient\(140deg, oklch\(.+\), oklch\(.+\)\)$/);
  });
});
