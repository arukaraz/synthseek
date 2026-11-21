import { CompletionContext } from "@codemirror/autocomplete";
import type { Completion, CompletionResult } from "@codemirror/autocomplete";
import { EditorState } from "@codemirror/state";
import { describe, expect, it } from "vitest";

import { THEME_CONTRACT } from "@theme/contract";

import { buildCompletionLists, completionContextOf, completionSourceOf, isWordText, trailingWord } from "../completion";
import { SNIPPETS } from "../constants";
import type { ThemeCopy } from "../types";

const copy: ThemeCopy = {
  tokens: {
    "--color-primary-500": { label: "Primary", hint: "" },
    "--surface-bg": { label: "Page background", hint: "" },
  },
  parts: { widget: "One widget on a board" },
  snippets: { glass: "Frosted glass panel" },
};

const lists = buildCompletionLists(copy);
const source = completionSourceOf(lists);

async function resultAt(doc: string, explicit = false): Promise<CompletionResult | null> {
  const state = EditorState.create({ doc });
  return source(new CompletionContext(state, doc.length, explicit));
}

function labels(result: CompletionResult | null): string[] {
  return result === null ? [] : result.options.map((option) => option.label);
}

describe("completionContextOf", () => {
  it("reads the word before the cursor", () => {
    expect(trailingWord("color: var(--sur")).toBe("--sur");
    expect(trailingWord("a {\n  ")).toBe("");
    expect(isWordText("--a-b_c1")).toBe(true);
    expect(isWordText("a b")).toBe(false);
  });

  it("is a token context after two dashes", () => {
    expect(completionContextOf("  --col", false)).toEqual({ kind: "token", word: "--col" });
  });

  it("is a token context inside var( even with no word yet or a space after the parenthesis", () => {
    expect(completionContextOf("color: var(", false)).toEqual({ kind: "token", word: "" });
    expect(completionContextOf("color: var( su", false)).toEqual({ kind: "token", word: "su" });
  });

  it('is a part context inside [data-part=" with either quote', () => {
    expect(completionContextOf('[data-part="wid', false)).toEqual({ kind: "part", word: "wid" });
    expect(completionContextOf("[data-part='", false)).toEqual({ kind: "part", word: "" });
  });

  it("is a general context for a word of two letters, and for nothing shorter unless explicit", () => {
    expect(completionContextOf("  gl", false)).toEqual({ kind: "general", word: "gl" });
    expect(completionContextOf("  g", false)).toBeNull();
    expect(completionContextOf("  ", false)).toBeNull();
    expect(completionContextOf("  ", true)).toEqual({ kind: "general", word: "" });
  });
});

describe("the completion lists", () => {
  it("is built once with one entry per contract token, part and snippet", () => {
    expect(lists.byName).toHaveLength(THEME_CONTRACT.tokens.length);
    expect(lists.parts).toHaveLength(THEME_CONTRACT.parts.length);
    expect(lists.general).toHaveLength(SNIPPETS.length + THEME_CONTRACT.tokens.length);
    expect(lists.colorTokens.has("--color-primary-500")).toBe(true);
    expect(lists.colorTokens.has("--radius")).toBe(false);
  });

  it("labels a token by its name with its translated label as detail", () => {
    const option = lists.byName.find((entry) => entry.label === "--color-primary-500");

    expect(option?.detail).toBe("Primary");
    expect(option?.apply).toBe("--color-primary-500");
    expect(option === undefined ? undefined : lists.tokenOf.get(option)).toBe("--color-primary-500");
  });
});

describe("completionSourceOf", () => {
  it("offers the contract tokens after two dashes, replacing the word", async () => {
    const result = await resultAt("a {\n  color: --co");

    expect(result?.from).toBe("a {\n  color: ".length);
    expect(labels(result)).toContain("--color-primary-500");
    expect(labels(result)).not.toContain("glass");
  });

  it("offers the contract tokens inside var(", async () => {
    const result = await resultAt("a { color: var(");

    expect(result?.from).toBe("a { color: var(".length);
    expect(labels(result)).toContain("--surface-bg");
  });

  it('offers the parts, with their translated description, inside [data-part="', async () => {
    const result = await resultAt('[data-part="');

    expect(labels(result)).toEqual(THEME_CONTRACT.parts.map((part) => part.name));
    expect(result?.options.find((option) => option.label === "widget")?.detail).toBe("One widget on a board");
  });

  it("offers snippets and tokens by their translated label elsewhere", async () => {
    const result = await resultAt("a {\n  gl");
    const options: readonly Completion[] = result?.options ?? [];

    expect(options.find((option) => option.label === "glass")?.detail).toBe("Frosted glass panel");
    expect(options.find((option) => option.label === "Primary")?.apply).toBe("var(--color-primary-500)");
  });

  it("offers nothing for a single letter until completion is asked for", async () => {
    expect(await resultAt("a {\n  g")).toBeNull();
    expect(labels(await resultAt("a {\n  g", true)).length).toBeGreaterThan(0);
  });

  it("keeps the list while the word is typed on", async () => {
    const result = await resultAt("a { color: var(--su");
    const validFor = result?.validFor;

    expect(typeof validFor).toBe("function");
    if (typeof validFor === "function") {
      const state = EditorState.create({ doc: "" });
      expect(validFor("--sur", 0, 5, state)).toBe(true);
      expect(validFor("--sur)", 0, 6, state)).toBe(false);
    }
  });
});
