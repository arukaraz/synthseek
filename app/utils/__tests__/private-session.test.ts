import { describe, expect, it } from "vitest";

import { privateSessionActive } from "../private-session";

const NOW = Date.parse("2026-11-11T12:00:00Z");

function session(until: Date | null, open = false) {
  return { privateSessionUntil: until, privateSessionOpen: open };
}

describe("privateSessionActive", () => {
  it("is off for nobody, and for an account that never started one", () => {
    expect(privateSessionActive(null, NOW)).toBe(false);
    expect(privateSessionActive(undefined, NOW)).toBe(false);
    expect(privateSessionActive(session(null), NOW)).toBe(false);
  });

  it("is on while the end is still ahead", () => {
    expect(privateSessionActive(session(new Date(NOW + 1)), NOW)).toBe(true);
  });

  it("is off at the moment it ends and afterwards", () => {
    expect(privateSessionActive(session(new Date(NOW)), NOW)).toBe(false);
    expect(privateSessionActive(session(new Date(NOW - 1)), NOW)).toBe(false);
  });

  it("stays on with no end while it is open", () => {
    expect(privateSessionActive(session(null, true), NOW)).toBe(true);
    expect(privateSessionActive(session(new Date(NOW - 1), true), NOW)).toBe(true);
  });
});
