import { describe, it, expect, afterEach, vi } from "vitest";

import { isRovingKey, isThemeValue, nextRovingIndex, lastUsedTime, createdTime, publicEndpoint } from "../helpers";

describe("isRovingKey", () => {
  it("returns true for every roving navigation key", () => {
    for (const key of ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"]) {
      expect(isRovingKey(key)).toBe(true);
    }
  });

  it("returns false for an unrelated key", () => {
    expect(isRovingKey("Enter")).toBe(false);
    expect(isRovingKey("a")).toBe(false);
  });
});

describe("isThemeValue", () => {
  it("accepts the configured theme values", () => {
    expect(isThemeValue("dark")).toBe(true);
    expect(isThemeValue("midnight")).toBe(true);
    expect(isThemeValue("ocean")).toBe(true);
  });

  it("rejects unknown values and undefined", () => {
    expect(isThemeValue("light")).toBe(false);
    expect(isThemeValue(undefined)).toBe(false);
  });
});

describe("nextRovingIndex", () => {
  it("advances forward and wraps for next keys", () => {
    expect(nextRovingIndex(0, 3, "ArrowRight")).toBe(1);
    expect(nextRovingIndex(2, 3, "ArrowDown")).toBe(0);
  });

  it("moves backward and wraps for previous keys", () => {
    expect(nextRovingIndex(2, 3, "ArrowLeft")).toBe(1);
    expect(nextRovingIndex(0, 3, "ArrowUp")).toBe(2);
  });

  it("jumps to the first and last index for Home and End", () => {
    expect(nextRovingIndex(2, 3, "Home")).toBe(0);
    expect(nextRovingIndex(0, 3, "End")).toBe(2);
  });
});

describe("lastUsedTime", () => {
  it("returns null when no date is provided", () => {
    expect(lastUsedTime(null)).toBeNull();
  });

  it("returns a formatted string for a real date", () => {
    expect(lastUsedTime(new Date("2024-01-01T00:00:00Z"))).toBeTypeOf("string");
  });
});

describe("createdTime", () => {
  it("formats a date into a short date string", () => {
    expect(createdTime(new Date("2024-01-01T00:00:00Z"))).toBeTypeOf("string");
  });
});

describe("publicEndpoint", () => {
  const originalWindow = globalThis.window;

  afterEach(() => {
    globalThis.window = originalWindow;
    vi.unstubAllGlobals();
  });

  it("uses the configured public base URL and strips trailing slashes", () => {
    expect(publicEndpoint("/api/v1/mcp", "https://music.example.com")).toBe("https://music.example.com/api/v1/mcp");
    expect(publicEndpoint("/api/v1/mcp", "https://music.example.com///")).toBe("https://music.example.com/api/v1/mcp");
  });

  it("falls back to the relative path when window is undefined", () => {
    vi.stubGlobal("window", undefined);
    expect(publicEndpoint("/api/v1/mcp")).toBe("/api/v1/mcp");
  });

  it("falls back to the browser origin when no base URL is set", () => {
    vi.stubGlobal("window", { location: { origin: "http://localhost:3000" } });
    expect(publicEndpoint("/api/v1/mcp")).toBe("http://localhost:3000/api/v1/mcp");
  });

  it("derives every inbound surface from the same base, so two of them cannot disagree", () => {
    const base = "https://music.example.com";
    expect(publicEndpoint("/subsonic", base)).toBe("https://music.example.com/subsonic");
    expect(publicEndpoint("/api/v1/mcp", base)).toBe("https://music.example.com/api/v1/mcp");
  });
});
