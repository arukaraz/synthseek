import { describe, expect, it } from "vitest";

import { deriveNotes, normalizeWhitespace, tokenizeInline } from "../helpers";
import type { ChangelogSection } from "../types";

describe("tokenizeInline", () => {
  it("returns a single text token for plain text", () => {
    expect(tokenizeInline("hello world")).toEqual([{ type: "text", value: "hello world" }]);
  });

  it("parses bold segments", () => {
    expect(tokenizeInline("a **bold** b")).toEqual([
      { type: "text", value: "a " },
      { type: "bold", value: "bold" },
      { type: "text", value: " b" },
    ]);
  });

  it("parses inline code", () => {
    expect(tokenizeInline("run `npm test` now")).toEqual([
      { type: "text", value: "run " },
      { type: "code", value: "npm test" },
      { type: "text", value: " now" },
    ]);
  });

  it("parses links", () => {
    expect(tokenizeInline("see [#2](https://example.com/2)")).toEqual([
      { type: "text", value: "see " },
      { type: "link", value: "#2", href: "https://example.com/2" },
    ]);
  });

  it("treats an unterminated bold marker as text", () => {
    expect(tokenizeInline("a **b")).toEqual([{ type: "text", value: "a **b" }]);
  });

  it("handles mixed markup", () => {
    expect(tokenizeInline("**A** and `b` and [c](u)")).toEqual([
      { type: "bold", value: "A" },
      { type: "text", value: " and " },
      { type: "code", value: "b" },
      { type: "text", value: " and " },
      { type: "link", value: "c", href: "u" },
    ]);
  });

  it("treats an unterminated code marker as text", () => {
    expect(tokenizeInline("run `npm")).toEqual([{ type: "text", value: "run `npm" }]);
  });

  it("treats a bracket without a following parenthesis as text", () => {
    expect(tokenizeInline("a [label] b")).toEqual([{ type: "text", value: "a [label] b" }]);
  });

  it("treats a bracket with no closing bracket as text", () => {
    expect(tokenizeInline("a [label")).toEqual([{ type: "text", value: "a [label" }]);
  });

  it("treats a link with an unterminated href as text", () => {
    expect(tokenizeInline("a [label](href")).toEqual([{ type: "text", value: "a [label](href" }]);
  });
});

describe("normalizeWhitespace", () => {
  it("collapses newlines and indentation into single spaces", () => {
    expect(normalizeWhitespace("foo\n  bar\tbaz")).toBe("foo bar baz");
  });

  it("preserves a single leading and trailing space", () => {
    expect(normalizeWhitespace(" baz ")).toBe(" baz ");
  });

  it("leaves single-spaced text unchanged", () => {
    expect(normalizeWhitespace("already clean")).toBe("already clean");
  });
});

describe("deriveNotes", () => {
  it("flattens item sections into per-item notes and keeps body sections", () => {
    const sections: ChangelogSection[] = [{ category: "fix", items: ["a", "b"] }, { body: "prose" }];
    expect(deriveNotes(sections)).toEqual([
      { category: "fix", text: "a" },
      { category: "fix", text: "b" },
      { category: undefined, text: "prose" },
    ]);
  });

  it("skips sections with neither items nor body", () => {
    const sections: ChangelogSection[] = [{ heading: "Empty" }];
    expect(deriveNotes(sections)).toEqual([]);
  });
});
