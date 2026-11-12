import { describe, expect, it } from "vitest";

import { privateSessionActive } from "../private-session";

const NOW = Date.parse("2026-11-11T12:00:00Z");

describe("privateSessionActive", () => {
  it("is off for an account that never started one", () => {
    expect(privateSessionActive(null, NOW)).toBe(false);
    expect(privateSessionActive(undefined, NOW)).toBe(false);
  });

  it("is on while the end is still ahead", () => {
    expect(privateSessionActive(new Date(NOW + 1), NOW)).toBe(true);
  });

  it("is off at the moment it ends and afterwards", () => {
    expect(privateSessionActive(new Date(NOW), NOW)).toBe(false);
    expect(privateSessionActive(new Date(NOW - 1), NOW)).toBe(false);
  });
});
