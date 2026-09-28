import { describe, expect, it } from "vitest";

import { isPlaybackServerKey, playbackServerName } from "../playback-servers";

describe("playback servers", () => {
  it("recognises every server the player can stream from and nothing else", () => {
    expect(["plex", "navidrome", "jellyfin"].every(isPlaybackServerKey)).toBe(true);
    expect(isPlaybackServerKey("local")).toBe(false);
    expect(isPlaybackServerKey("spotify")).toBe(false);
  });

  it("names a known server and passes an unknown key through", () => {
    expect(playbackServerName("jellyfin")).toBe("Jellyfin");
    expect(playbackServerName("mystery")).toBe("mystery");
  });
});
