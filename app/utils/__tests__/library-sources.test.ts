import { describe, expect, it } from "vitest";

import { librarySourceName } from "../library-sources";

describe("librarySourceName", () => {
  it.each([
    ["spotify", "Spotify"],
    ["plex", "Plex"],
    ["navidrome", "Navidrome"],
    ["jellyfin", "Jellyfin"],
  ])("names the %s library source", (key, name) => {
    expect(librarySourceName(key)).toBe(name);
  });

  it.each([["jspf"], ["deezer"], [""], [null], [undefined]])(
    "returns null for %s, which is no library source",
    (key) => {
      expect(librarySourceName(key)).toBeNull();
    }
  );
});
