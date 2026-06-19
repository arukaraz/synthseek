import { describe, expect, it } from "vitest";

import { playlistNamesDirty, playlistNamesDraft, playlistNamesPatch } from "../helpers";

describe("playlistNamesDraft", () => {
  it("fills every kind with an empty string when no names are saved", () => {
    expect(playlistNamesDraft(undefined)).toEqual({
      "cf-recommendations": "",
      "weekly-exploration": "",
      "weekly-jams": "",
      "daily-jams": "",
    });
  });

  it("seeds known kinds from the saved partial record", () => {
    expect(playlistNamesDraft({ "weekly-jams": "My Jams" })).toMatchObject({
      "weekly-jams": "My Jams",
      "daily-jams": "",
    });
  });
});

describe("playlistNamesPatch", () => {
  it("keeps only non-empty trimmed values", () => {
    const draft = playlistNamesDraft({ "weekly-jams": "  Road Trip  ", "daily-jams": "   " });
    expect(playlistNamesPatch(draft)).toEqual({ "weekly-jams": "Road Trip" });
  });

  it("returns an empty patch when every input is blank", () => {
    expect(playlistNamesPatch(playlistNamesDraft(undefined))).toEqual({});
  });
});

describe("playlistNamesDirty", () => {
  it("is clean when the draft matches the saved record", () => {
    const draft = playlistNamesDraft({ "weekly-jams": "Jams" });
    expect(playlistNamesDirty(draft, { "weekly-jams": "Jams" })).toBe(false);
  });

  it("ignores surrounding whitespace differences", () => {
    const draft = playlistNamesDraft({ "weekly-jams": "  Jams  " });
    expect(playlistNamesDirty(draft, { "weekly-jams": "Jams" })).toBe(false);
  });

  it("is dirty when a name changes", () => {
    const draft = playlistNamesDraft({ "weekly-jams": "New" });
    expect(playlistNamesDirty(draft, { "weekly-jams": "Old" })).toBe(true);
  });

  it("is dirty when a new name is added", () => {
    const draft = playlistNamesDraft({ "daily-jams": "Daily" });
    expect(playlistNamesDirty(draft, undefined)).toBe(true);
  });
});
