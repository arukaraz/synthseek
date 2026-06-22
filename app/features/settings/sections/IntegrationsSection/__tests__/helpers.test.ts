import { describe, it, expect, beforeAll } from "vitest";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { buildRedirectUri, previewName } from "../helpers";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

describe("buildRedirectUri", () => {
  it("returns an empty string when no base url is given", () => {
    expect(buildRedirectUri("")).toBe("");
  });

  it("appends the spotify callback path to the base url", () => {
    expect(buildRedirectUri("https://app.example.com")).toBe("https://app.example.com/api/auth/spotify/callback");
  });

  it("strips a single trailing slash before appending the callback path", () => {
    expect(buildRedirectUri("https://app.example.com/")).toBe("https://app.example.com/api/auth/spotify/callback");
  });
});

describe("previewName", () => {
  const base = enSettings.plex.previewSampleName;

  it("returns the base sample name when the affix is off", () => {
    expect(previewName("off", " - ", "alice")).toBe(base);
  });

  it("returns the base sample name when the username is empty", () => {
    expect(previewName("prefix", " - ", "")).toBe(base);
  });

  it("prepends the username and separator for a prefix affix", () => {
    expect(previewName("prefix", " - ", "alice")).toBe(`alice - ${base}`);
  });

  it("appends the separator and username for a suffix affix", () => {
    expect(previewName("suffix", " - ", "alice")).toBe(`${base} - alice`);
  });
});
