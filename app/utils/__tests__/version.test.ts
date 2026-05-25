import { describe, expect, it } from "vitest";

import { isBreakingUpdate } from "../version";

describe("isBreakingUpdate", () => {
  it("returns false for same version", () => {
    expect(isBreakingUpdate("1.4.2", "1.4.2")).toBe(false);
  });

  it("returns false for minor bump", () => {
    expect(isBreakingUpdate("1.4.2", "1.5.0")).toBe(false);
  });

  it("returns false for patch bump", () => {
    expect(isBreakingUpdate("1.4.2", "1.4.3")).toBe(false);
  });

  it("returns true for 1.x → 2.0", () => {
    expect(isBreakingUpdate("1.4.2", "2.0.0")).toBe(true);
  });

  it("returns true for 2.x → 3.x", () => {
    expect(isBreakingUpdate("2.5.0", "3.0.0")).toBe(true);
  });

  it("returns false for a downgrade", () => {
    expect(isBreakingUpdate("2.0.0", "1.5.0")).toBe(false);
  });

  it("returns false for unparseable versions", () => {
    expect(isBreakingUpdate("dev", "2.0.0")).toBe(false);
    expect(isBreakingUpdate("1.0.0", "next")).toBe(false);
    expect(isBreakingUpdate("1.0", "2.0")).toBe(false);
    expect(isBreakingUpdate("1.0.0-rc.1", "2.0.0")).toBe(false);
  });

  it("returns false for null/undefined inputs", () => {
    expect(isBreakingUpdate(null, "2.0.0")).toBe(false);
    expect(isBreakingUpdate("1.0.0", null)).toBe(false);
    expect(isBreakingUpdate(undefined, undefined)).toBe(false);
    expect(isBreakingUpdate("", "2.0.0")).toBe(false);
  });
});
