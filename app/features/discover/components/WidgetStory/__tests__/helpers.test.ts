import { describe, expect, it } from "vitest";

import { createRecapResult, createTrackResult } from "@test/factories";

import { storyCoversOf, storyIndexOf, storyNoteOf, storyPagesOf } from "../helpers";

const RECAP = createRecapResult([
  { kind: "plays", value: 1234 },
  { kind: "minutes", value: 5400 },
  { kind: "topArtist", name: "Alpha", artistId: null, cover: "https://img.test/alpha.jpg", plays: 14 },
  { kind: "topTrack", trackId: "t1", title: "Anthem", artist: "Alpha", cover: null, plays: 1 },
  {
    kind: "topAlbums",
    albums: [
      { id: "a1", name: "One", artist: "Alpha", cover: "https://img.test/one.jpg", plays: 9 },
      { id: "a2", name: "Two", artist: "Beta", cover: null, plays: 3 },
    ],
  },
  {
    kind: "topGenres",
    genres: [
      { label: "Rock", plays: 6, share: 0.6 },
      { label: "Jazz", plays: 2, share: 0.2 },
    ],
  },
  { kind: "newArtists", count: 3, names: ["Alpha", "Beta"] },
  { kind: "listeningAge", from: 1994, to: 1998, plays: 4, share: 0.25 },
  { kind: "busiestDay", date: "2026-03-02", plays: 5 },
  { kind: "peakHour", hour: 21, plays: 7 },
]);

describe("storyPagesOf", () => {
  it("writes one page per fact in the order the server sent", () => {
    const pages = storyPagesOf(RECAP);
    expect(pages.map((page) => [page.label, page.headline, page.detail])).toEqual([
      ["You pressed play", "1.2K", "times in this period"],
      ["Minutes listened", "5.4K", "About 90 hours of music"],
      ["Your top artist", "Alpha", "14 plays"],
      ["Your top song", "Anthem", "Alpha · 1 play"],
      ["Your top albums", "One", null],
      ["Your top genres", "Rock", null],
      ["New artists", "3", "Including Alpha, Beta"],
      ["Your listening age", "1994 to 1998", "25% of your plays came from music released in these years"],
      ["Your busiest day", "Monday, March 2", "5 plays"],
      ["Your peak hour", "9 PM", "7 plays"],
    ]);
  });

  it("ranks albums and shares genres in their rows, with the first cover on the page", () => {
    const [, , , , albums, genres] = storyPagesOf(RECAP);
    expect(albums?.cover).toBe("https://img.test/one.jpg");
    expect(albums?.rows).toEqual([
      { key: "a1", label: "1. One", value: "9 plays" },
      { key: "a2", label: "2. Two", value: "3 plays" },
    ]);
    expect(genres?.rows.map((row) => row.value)).toEqual(["60%", "20%"]);
  });

  it("is empty for anything but a recap", () => {
    expect(storyPagesOf(createTrackResult([]))).toEqual([]);
    expect(storyCoversOf(createTrackResult([]))).toEqual([]);
    expect(storyNoteOf(createTrackResult([]))).toBeNull();
  });
});

describe("storyNoteOf", () => {
  it("speaks only when the recap came back without pages", () => {
    expect(storyNoteOf(RECAP)).toBeNull();
    expect(storyNoteOf(createRecapResult([], { plays: 3 }))).toBe(
      "Not enough listening yet: 3 of the 20 plays this recap needs."
    );
  });
});

describe("storyIndexOf", () => {
  it("wraps past both ends", () => {
    expect(storyIndexOf(4, 4)).toBe(0);
    expect(storyIndexOf(-1, 4)).toBe(3);
    expect(storyIndexOf(2, 4)).toBe(2);
    expect(storyIndexOf(3, 0)).toBe(0);
  });
});
