import { describe, it, expect } from "vitest";

import { resolveByMessage } from "../registry";

describe("resolveByMessage", () => {
  it("returns null for an empty message", () => {
    expect(resolveByMessage("")).toBeNull();
  });

  it("returns null for an unmatched message", () => {
    expect(resolveByMessage("totally unrelated text")).toBeNull();
  });

  it("matches the Spotify premium propagation pattern with warning severity", () => {
    const result = resolveByMessage("Active premium subscription required for the owner");
    expect(result).not.toBeNull();
    expect(result?.severity).toBe("warning");
  });

  it("matches a network failure with error severity", () => {
    const result = resolveByMessage("fetch failed");
    expect(result).not.toBeNull();
    expect(result?.severity).toBe("error");
  });

  it("routes UNAUTHORIZED to the spotify session code (error) when spotify is preferred", () => {
    const result = resolveByMessage("UNAUTHORIZED", "spotify");
    expect(result).not.toBeNull();
    expect(result?.severity).toBe("error");
  });

  it("routes UNAUTHORIZED to the generic signed-out code (warning) when generic is preferred", () => {
    const result = resolveByMessage("UNAUTHORIZED", "generic");
    expect(result).not.toBeNull();
    expect(result?.severity).toBe("warning");
  });

  it("carries a duration override for premium propagation", () => {
    const result = resolveByMessage("Active premium subscription required for the owner");
    expect(result?.duration).toBe(12000);
  });
});
