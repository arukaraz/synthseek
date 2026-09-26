import { describe, expect, it } from "vitest";

import {
  Album,
  DEFAULT_IMPORT_CONFIG,
  FILTER_ICONS,
  FILTER_VALUES,
  SORT_VALUES,
  TRACK_PREVIEW_LIMIT,
} from "../constants";

describe("library filter constants", () => {
  it("maps every filter value to an icon component", () => {
    for (const value of FILTER_VALUES) {
      expect(FILTER_ICONS[value]).toBeTypeOf("object");
    }
  });

  it("lists the filter values in display order", () => {
    expect(FILTER_VALUES).toEqual(["all", "playlists", "albums", "liked"]);
  });

  it("lists the sortable columns", () => {
    expect(SORT_VALUES).toEqual(["name", "type", "tracks", "imported", "lastSync", "syncStatus"]);
  });

  it("re-exports the album icon", () => {
    expect(Album).toBeTypeOf("object");
  });
});

describe("import defaults", () => {
  it("defaults to flexible 320kbps mp3", () => {
    expect(DEFAULT_IMPORT_CONFIG).toEqual({
      bitrate: { value: 320, matching: "flexible" },
      format: { value: "mp3", matching: "flexible" },
    });
  });

  it("previews five tracks", () => {
    expect(TRACK_PREVIEW_LIMIT).toBe(5);
  });
});
