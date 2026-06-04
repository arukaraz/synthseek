import { describe, it, expect } from "vitest";
import { formatDelegatedTo } from "../helpers";

describe("formatDelegatedTo", () => {
  it("title-cases a manager key", () => {
    expect(formatDelegatedTo("lidarr")).toBe("Lidarr");
  });

  it("returns null for null", () => {
    expect(formatDelegatedTo(null)).toBeNull();
  });

  it("returns null for an empty string", () => {
    expect(formatDelegatedTo("")).toBeNull();
  });

  it("returns null for whitespace only", () => {
    expect(formatDelegatedTo("   ")).toBeNull();
  });

  it("trims surrounding whitespace before formatting", () => {
    expect(formatDelegatedTo("  lidarr  ")).toBe("Lidarr");
  });
});
