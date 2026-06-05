import { describe, expect, it } from "vitest";

import enLibrary from "@modules/i18n/messages/en/library.json";
import { createMockLibraryItem } from "@test/mocks/feature-hooks.mock";

import {
  compareItems,
  formatLastSync,
  libraryTypeLowerLabelKey,
  libraryTypeTone,
  matchesFilter,
  matchesSearch,
} from "../helpers";

describe("matchesFilter", () => {
  const playlist = createMockLibraryItem({ type: "playlist" });
  const album = createMockLibraryItem({ type: "album" });
  const liked = createMockLibraryItem({ type: "liked" });

  it("matches every item when filter is all", () => {
    expect(matchesFilter(playlist, "all")).toBe(true);
    expect(matchesFilter(album, "all")).toBe(true);
    expect(matchesFilter(liked, "all")).toBe(true);
  });

  it("matches only playlists", () => {
    expect(matchesFilter(playlist, "playlists")).toBe(true);
    expect(matchesFilter(album, "playlists")).toBe(false);
  });

  it("matches only albums", () => {
    expect(matchesFilter(album, "albums")).toBe(true);
    expect(matchesFilter(playlist, "albums")).toBe(false);
  });

  it("matches only liked when filter is liked", () => {
    expect(matchesFilter(liked, "liked")).toBe(true);
    expect(matchesFilter(album, "liked")).toBe(false);
  });
});

describe("matchesSearch", () => {
  const item = createMockLibraryItem({ name: "Summer Mix", subtitle: "12 tracks" });

  it("matches when query is empty", () => {
    expect(matchesSearch(item, "")).toBe(true);
  });

  it("matches when query is only whitespace", () => {
    expect(matchesSearch(item, "   ")).toBe(true);
  });

  it("matches against the name case-insensitively", () => {
    expect(matchesSearch(item, "summer")).toBe(true);
  });

  it("matches against the subtitle", () => {
    expect(matchesSearch(item, "tracks")).toBe(true);
  });

  it("returns false when nothing matches", () => {
    expect(matchesSearch(item, "winter")).toBe(false);
  });

  it("returns false when name misses and subtitle is empty", () => {
    const noSubtitle = createMockLibraryItem({ name: "Alpha", subtitle: "" });
    expect(matchesSearch(noSubtitle, "zzz")).toBe(false);
  });
});

describe("compareItems", () => {
  const a = createMockLibraryItem({
    id: "a",
    name: "Alpha",
    type: "liked",
    totalTracks: 3,
    imported: false,
    syncEnabled: false,
    lastSyncedAt: new Date("2024-01-01T00:00:00Z"),
  });
  const b = createMockLibraryItem({
    id: "b",
    name: "Beta",
    type: "album",
    totalTracks: 10,
    imported: true,
    syncEnabled: true,
    lastSyncedAt: new Date("2024-06-01T00:00:00Z"),
  });

  it("sorts by name ascending", () => {
    expect(compareItems(a, b, "name", "asc")).toBeLessThan(0);
  });

  it("sorts by name descending", () => {
    expect(compareItems(a, b, "name", "desc")).toBeGreaterThan(0);
  });

  it("sorts by type rank", () => {
    expect(compareItems(a, b, "type", "asc")).toBeLessThan(0);
  });

  it("sorts by track count", () => {
    expect(compareItems(a, b, "tracks", "asc")).toBeLessThan(0);
  });

  it("sorts by imported flag", () => {
    expect(compareItems(a, b, "imported", "asc")).toBeLessThan(0);
  });

  it("sorts by last sync timestamp", () => {
    expect(compareItems(a, b, "lastSync", "asc")).toBeLessThan(0);
  });

  it("treats missing last sync timestamps as zero", () => {
    const noSync = createMockLibraryItem({ id: "c", lastSyncedAt: null });
    expect(compareItems(noSync, b, "lastSync", "asc")).toBeLessThan(0);
  });

  it("sorts by sync status", () => {
    expect(compareItems(a, b, "syncStatus", "asc")).toBeLessThan(0);
  });
});

describe("formatLastSync", () => {
  it("returns the never label for null", () => {
    expect(formatLastSync(null)).toBe(enLibrary.spotifyLibrary.detail.lastSyncNever);
  });

  it("formats a provided date", () => {
    expect(formatLastSync(new Date("2024-01-01T00:00:00Z"))).not.toBe(enLibrary.spotifyLibrary.detail.lastSyncNever);
  });
});

describe("libraryTypeTone", () => {
  it("returns the matching tone for each type", () => {
    expect(libraryTypeTone("playlist")).toBe("playlist");
    expect(libraryTypeTone("album")).toBe("album");
    expect(libraryTypeTone("liked")).toBe("liked");
  });
});

describe("libraryTypeLowerLabelKey", () => {
  it("maps each type to its lower label key", () => {
    expect(libraryTypeLowerLabelKey("playlist")).toBe("spotifyLibrary.type.playlistLower");
    expect(libraryTypeLowerLabelKey("album")).toBe("spotifyLibrary.type.albumLower");
    expect(libraryTypeLowerLabelKey("liked")).toBe("spotifyLibrary.type.likedLower");
  });
});
