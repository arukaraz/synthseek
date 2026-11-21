import { describe, expect, it } from "vitest";

import { THEME_CONTRACT } from "@theme/contract";
import { presetValues, setToken } from "@theme/custom";

import {
  changedNamesOf,
  contrastOf,
  dirtySectionsOf,
  essentialsOf,
  fontChoicesOf,
  fontStackOf,
  formatRatio,
  matchesQuery,
  plainNumber,
} from "../helpers";
import { SECTION_TOKENS } from "../constants";
import { makeDraft } from "./fixtures";

describe("essentialsOf", () => {
  it("keeps only the essential tokens of a section that has some", () => {
    const brand = SECTION_TOKENS.get("brand") ?? [];

    expect(essentialsOf(brand).map((token) => token.name)).toEqual([
      "--color-primary-500",
      "--color-secondary-500",
      "--color-accent-500",
    ]);
  });

  it("falls back to every token of a section with no essential one", () => {
    const types = SECTION_TOKENS.get("content-types") ?? [];

    expect(types.some((token) => token.essential === true)).toBe(false);
    expect(essentialsOf(types)).toHaveLength(types.length);
  });
});

describe("matchesQuery", () => {
  const token = THEME_CONTRACT.tokens[0];

  it("matches the label, the hint and the token name without regard to case", () => {
    const copy = { label: "Primary", hint: "Buttons and links" };

    expect(matchesQuery(token, copy, "primary")).toBe(true);
    expect(matchesQuery(token, copy, "links")).toBe(true);
    expect(matchesQuery(token, copy, token.name.toLowerCase())).toBe(true);
    expect(matchesQuery(token, copy, "zzz")).toBe(false);
  });
});

describe("plainNumber", () => {
  it("reads a number in the token's unit and refuses anything else", () => {
    expect(plainNumber("0.875rem", "rem")).toBe(0.875);
    expect(plainNumber("1.05", "")).toBe(1.05);
    expect(plainNumber("0", "rem")).toBe(0);
    expect(plainNumber("-0.02em", "em")).toBe(-0.02);
    expect(plainNumber("1.5rem", "em")).toBeNull();
    expect(plainNumber("1.5", "rem")).toBeNull();
    expect(plainNumber("calc(1rem * 2)", "rem")).toBeNull();
    expect(plainNumber("var(--x)", "")).toBeNull();
    expect(plainNumber("0x10", "")).toBeNull();
    expect(plainNumber("rem", "rem")).toBeNull();
  });
});

describe("contrastOf", () => {
  it("is null without a background or when either side does not parse", () => {
    const light = presetValues("dark")["--surface-fg"];
    const dark = presetValues("dark")["--surface-bg"];

    expect(contrastOf(light, null)).toBeNull();
    expect(contrastOf("var(--x)", dark)).toBeNull();
    expect(contrastOf(light, "var(--x)")).toBeNull();
    expect(contrastOf(light, dark)).toBeGreaterThan(4.5);
  });

  it("writes a ratio with one decimal", () => {
    expect(formatRatio(4.4999)).toBe("4.5:1");
    expect(formatRatio(12)).toBe("12.0:1");
  });
});

describe("fonts", () => {
  it("puts an uploaded family in front of the factory stack of the token", () => {
    const factory = presetValues("dark");

    expect(fontStackOf("--font-sans", "Inter")).toBe(`"Inter", ${factory["--font-sans"]}`);
    expect(fontStackOf("--font-mono", "Inter")).toBe(`"Inter", ${factory["--font-mono"]}`);
  });

  it("offers six stacks for the interface fonts, three for mono, and one option per upload", () => {
    const label = (key: string) => key;

    expect(fontChoicesOf("--font-sans", [], label)).toHaveLength(6);
    expect(fontChoicesOf("--font-heading", [], label)).toHaveLength(6);
    expect(fontChoicesOf("--font-mono", [], label)).toHaveLength(3);
    const withUpload = fontChoicesOf("--font-sans", ["Inter"], label);
    expect(withUpload).toHaveLength(7);
    expect(withUpload[6]).toEqual({ value: fontStackOf("--font-sans", "Inter"), label: "Inter" });
  });

  it("makes the factory stack the System option", () => {
    const factory = presetValues("dark");

    expect(fontChoicesOf("--font-sans", [], (key) => key)[0]).toEqual({
      value: factory["--font-sans"],
      label: "system",
    });
    expect(fontChoicesOf("--font-mono", [], (key) => key)[0]).toEqual({
      value: factory["--font-mono"],
      label: "systemMono",
    });
  });
});

describe("changedNamesOf and dirtySectionsOf", () => {
  const tokens = THEME_CONTRACT.tokens;

  it("lists the tokens that differ from the preset", () => {
    const draft = setToken(makeDraft(), "--radius", "0.75rem");

    expect([...changedNamesOf(draft, tokens)]).toEqual(["--radius"]);
  });

  it("marks the sections whose values differ from the saved draft", () => {
    const saved = makeDraft();
    const draft = setToken(saved, "--radius", "0.75rem");

    expect([...dirtySectionsOf(draft, saved, tokens)]).toEqual(["shape"]);
    expect(dirtySectionsOf(saved, saved, tokens).size).toBe(0);
  });
});
