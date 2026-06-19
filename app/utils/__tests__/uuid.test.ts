import { describe, it, expect, afterEach, vi } from "vitest";
import { generateUuid } from "../uuid";

const V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe("generateUuid", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("secure context (crypto.randomUUID available)", () => {
    it("returns a canonical RFC-4122 v4 UUID", () => {
      expect(generateUuid()).toMatch(V4_REGEX);
    });

    it("produces unique values across many calls", () => {
      const seen = new Set<string>();
      for (let i = 0; i < 1000; i += 1) {
        seen.add(generateUuid());
      }
      expect(seen.size).toBe(1000);
    });
  });

  describe("fallback (crypto.randomUUID undefined, issue #4 regression guard)", () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    function stubWithoutRandomUuid(): void {
      const realGetRandomValues = crypto.getRandomValues.bind(crypto);
      vi.stubGlobal("crypto", {
        randomUUID: undefined,
        getRandomValues: realGetRandomValues,
      });
    }

    it("still returns a canonical v4 UUID via getRandomValues", () => {
      stubWithoutRandomUuid();
      expect(generateUuid()).toMatch(V4_REGEX);
    });

    it("sets the version nibble to 4", () => {
      stubWithoutRandomUuid();
      const versionNibble = generateUuid().charAt(14);
      expect(versionNibble).toBe("4");
    });

    it("sets the variant nibble to one of 8, 9, a, b", () => {
      stubWithoutRandomUuid();
      const variantNibbles = new Set<string>();
      for (let i = 0; i < 1000; i += 1) {
        variantNibbles.add(generateUuid().charAt(19));
      }
      for (const nibble of variantNibbles) {
        expect(["8", "9", "a", "b"]).toContain(nibble);
      }
    });

    it("produces unique values across many calls", () => {
      stubWithoutRandomUuid();
      const seen = new Set<string>();
      for (let i = 0; i < 1000; i += 1) {
        seen.add(generateUuid());
      }
      expect(seen.size).toBe(1000);
    });
  });
});
