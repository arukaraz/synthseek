import { Text } from "@codemirror/state";
import { describe, expect, it } from "vitest";

import { THEME_CONTRACT } from "@theme/contract";
import { formatOklch } from "@theme/custom";

import { THEME_JSON_PATH } from "../constants";
import {
  cursorIn,
  diagnosticRange,
  fileStatusOf,
  insertionOf,
  insertItems,
  minimalChange,
  newFilePath,
  newFileProblem,
  readonlyJson,
  resolveOpenFile,
  swatchOf,
  treeOf,
  versionIsOpen,
  withFile,
  withoutFile,
} from "../helpers";
import type { InsertCategory, ThemeCopy } from "../types";
import { diagnosticOf, draftOf } from "./fixtures";

const PRIMARY = formatOklch({ l: 0.6, c: 0.2, h: 285, alpha: 1 });

const copy: ThemeCopy = {
  tokens: {
    "--color-primary-500": { label: "Primary", hint: "" },
    "--font-sans": { label: "Interface font", hint: "" },
  },
  parts: { widget: "One widget on a board" },
  snippets: { glass: "Frosted glass panel" },
};

function listed(category: InsertCategory, query = "", values = new Map<string, string>()) {
  return insertItems({ tokens: THEME_CONTRACT.tokens, values, copy, category, query });
}

describe("treeOf", () => {
  it("lists token files in contract order, components sorted, and custom.css last", () => {
    const draft = draftOf({ "components/zeta.css": "", "components/alpha.css": "", "custom.css": "" });
    const tree = treeOf(draft, draft, []);

    expect(tree.tokens.map((file) => file.path)).toEqual(THEME_CONTRACT.files.map((file) => `tokens/${file.id}.css`));
    expect(tree.components.map((file) => file.label)).toEqual(["alpha.css", "zeta.css"]);
    expect(tree.custom?.path).toBe("custom.css");
  });

  it("marks a file dirty when its text differs from the saved one or the saved draft lacks it", () => {
    const saved = draftOf({ "components/old.css": "a" });
    const draft = draftOf({
      "tokens/brand.css": ":root { --x: 1; }",
      "components/old.css": "a",
      "components/new.css": "",
    });
    const tree = treeOf(draft, saved, []);

    expect(tree.tokens.find((file) => file.path === "tokens/brand.css")?.dirty).toBe(true);
    expect(tree.tokens.find((file) => file.path === "tokens/shape.css")?.dirty).toBe(false);
    expect(tree.components.find((file) => file.label === "new.css")?.dirty).toBe(true);
    expect(tree.components.find((file) => file.label === "old.css")?.dirty).toBe(false);
  });

  it("marks only the broken paths and leaves custom null when the account has none", () => {
    const draft = draftOf();
    const tree = treeOf(draft, draft, ["tokens/text.css"]);

    expect(tree.tokens.filter((file) => file.broken).map((file) => file.path)).toEqual(["tokens/text.css"]);
    expect(tree.custom).toBeNull();
  });
});

describe("resolveOpenFile", () => {
  it("keeps theme.json and an existing file, and falls back to the first token file otherwise", () => {
    const draft = draftOf();

    expect(resolveOpenFile(THEME_JSON_PATH, draft)).toBe(THEME_JSON_PATH);
    expect(resolveOpenFile("tokens/shape.css", draft)).toBe("tokens/shape.css");
    expect(resolveOpenFile("components/gone.css", draft)).toBe("tokens/brand.css");
  });
});

describe("fileStatusOf", () => {
  it("splits errors from warnings and reports saved from the dirty flag", () => {
    const status = fileStatusOf(
      [diagnosticOf(), diagnosticOf({ severity: "warning" }), diagnosticOf({ severity: "warning" })],
      true
    );

    expect(status).toEqual({ errors: 1, warnings: 2, saved: false });
    expect(fileStatusOf([], false).saved).toBe(true);
  });
});

describe("readonlyJson", () => {
  it("writes the meta with the contract version and the follows list", () => {
    const draft = draftOf();
    const parsed = JSON.parse(readonlyJson({ ...draft, meta: { ...draft.meta, follows: ["--color-primary-400"] } }));

    expect(parsed).toEqual({
      name: "Mine",
      scheme: "dark",
      startedFrom: "dark",
      contract: THEME_CONTRACT.version,
      follows: ["--color-primary-400"],
    });
  });
});

describe("new files", () => {
  it("accepts lowercase letters, digits and dashes", () => {
    expect(newFileProblem("side-bar-2", draftOf())).toBeNull();
    expect(newFilePath("side-bar-2")).toBe("components/side-bar-2.css");
  });

  it.each(["", "Bad", "has space", "dots.in", "under_score", "slash/x"])("refuses %j as invalid", (name) => {
    expect(newFileProblem(name, draftOf())).toBe("invalid");
  });

  it("refuses a name that already exists in components", () => {
    expect(newFileProblem("board", draftOf({ "components/board.css": "" }))).toBe("taken");
  });

  it("adds and removes a file without touching the others", () => {
    const draft = draftOf({ "components/a.css": "a" });
    const added = withFile(draft, "components/b.css", "");
    const removed = withoutFile(added, "components/a.css");

    expect(Object.keys(added.files)).toContain("components/b.css");
    expect(Object.keys(removed.files)).not.toContain("components/a.css");
    expect(removed.files["components/b.css"]).toBe("");
    expect(draft.files["components/a.css"]).toBe("a");
  });
});

describe("where the cursor lands", () => {
  it("goes inside the braces of a part block", () => {
    const { text, cursor } = insertionOf('[data-part="widget"] {\n  \n}');

    expect(text.slice(0, cursor)).toBe('[data-part="widget"] {\n  ');
  });

  it("goes to the first empty line of a snippet", () => {
    const body = "@media (max-width: 640px) {\n  \n}";

    expect(body.slice(0, cursorIn(body))).toBe("@media (max-width: 640px) {\n  ");
  });

  it("goes to the end of a snippet or token with no empty line", () => {
    expect(insertionOf("var(--ring)").cursor).toBe("var(--ring)".length);
    expect(cursorIn("a: b;\n  c: d;")).toBe("a: b;\n  c: d;".length);
  });
});

describe("insertItems", () => {
  it("filters Colors to color tokens and Type to the typography file", () => {
    const colors = listed("colors");
    const type = listed("type");

    expect(colors.length).toBeGreaterThan(0);
    expect(colors.every((item) => item.kind === "token" && item.text.startsWith("var(--"))).toBe(true);
    expect(colors.some((item) => item.key === "--font-sans")).toBe(false);
    expect(type.some((item) => item.key === "--font-sans")).toBe(true);
    expect(type.some((item) => item.key === "--color-primary-500")).toBe(false);
  });

  it("puts every other token under Shape", () => {
    const shape = listed("shape");

    expect(shape.some((item) => item.key === "--radius")).toBe(true);
    expect(shape.some((item) => item.key === "--font-sans" || item.key === "--color-primary-500")).toBe(false);
  });

  it("lists parts as blocks and snippets as bodies", () => {
    const parts = listed("parts");
    const snippets = listed("snippets");

    expect(parts).toHaveLength(THEME_CONTRACT.parts.length);
    expect(parts.find((item) => item.key === '[data-part="widget"]')?.text).toBe('[data-part="widget"] {\n  \n}');
    expect(snippets.find((item) => item.key === "glass")?.description).toBe("Frosted glass panel");
    expect(snippets.find((item) => item.key === "gradient-text")).toBeDefined();
  });

  it("narrows by a query typed without the accents its description carries", () => {
    const accented: ThemeCopy = {
      ...copy,
      tokens: { ...copy.tokens, "--font-sans": { label: "Police d'écran", hint: "" } },
    };
    const items = insertItems({
      tokens: THEME_CONTRACT.tokens,
      values: new Map(),
      copy: accented,
      category: "all",
      query: "ecran",
    });

    expect(items.map((item) => item.key)).toEqual(["--font-sans"]);
  });

  it("lists everything under All and narrows by query on key and description", () => {
    const everything = listed("all");
    const found = listed("all", "FROSTED");

    expect(everything.length).toBe(
      listed("colors").length +
        listed("type").length +
        listed("shape").length +
        listed("parts").length +
        listed("snippets").length
    );
    expect(found.map((item) => item.key)).toEqual(["glass"]);
  });

  it("paints a swatch only for a color token whose value parses", () => {
    const values = new Map([
      ["--color-primary-500", PRIMARY],
      ["--surface-bg", "var(--elsewhere)"],
    ]);
    const colors = listed("colors", "", values);

    expect(colors.find((item) => item.key === "--color-primary-500")?.swatch).toBe(PRIMARY);
    expect(colors.find((item) => item.key === "--surface-bg")?.swatch).toBeNull();
    expect(swatchOf(undefined)).toBeNull();
  });

  it("describes a token by its label and current value", () => {
    const values = new Map([["--color-primary-500", PRIMARY]]);

    expect(listed("colors", "", values).find((item) => item.key === "--color-primary-500")?.description).toBe(
      `Primary, ${PRIMARY}`
    );
  });
});

describe("minimalChange", () => {
  it("replaces only the differing middle", () => {
    expect(minimalChange("abcXYZdef", "abc12def")).toEqual({ from: 3, to: 6, insert: "12" });
  });

  it("handles a pure insertion, a pure deletion and equal text", () => {
    expect(minimalChange("ab", "aXb")).toEqual({ from: 1, to: 1, insert: "X" });
    expect(minimalChange("aXb", "ab")).toEqual({ from: 1, to: 2, insert: "" });
    expect(minimalChange("same", "same")).toEqual({ from: 4, to: 4, insert: "" });
  });
});

describe("diagnosticRange", () => {
  const doc = Text.of(["one", "two two", "three"]);

  it("maps a 1-based line and column to offsets, treating the end column as inclusive", () => {
    const range = diagnosticRange(doc, diagnosticOf({ line: 2, column: 5, endLine: 2, endColumn: 7 }));

    expect(doc.sliceString(range.from, range.to)).toBe("two");
  });

  it("covers one character when the end equals the start", () => {
    const range = diagnosticRange(doc, diagnosticOf({ line: 1, column: 2, endLine: 1, endColumn: 2 }));

    expect(doc.sliceString(range.from, range.to)).toBe("n");
  });

  it("spans lines", () => {
    const range = diagnosticRange(doc, diagnosticOf({ line: 1, column: 3, endLine: 2, endColumn: 3 }));

    expect(doc.sliceString(range.from, range.to)).toBe("e\ntwo");
  });

  it("clamps a position past the end of a shortened document", () => {
    const short = Text.of(["a"]);
    const range = diagnosticRange(short, diagnosticOf({ line: 9, column: 40, endLine: 9, endColumn: 50 }));

    expect(range.from).toBeGreaterThanOrEqual(0);
    expect(range.to).toBeLessThanOrEqual(short.length);
    expect(range.to).toBeGreaterThan(range.from);
  });

  it("stays valid on an empty document", () => {
    const empty = Text.of([""]);

    expect(diagnosticRange(empty, diagnosticOf({ line: 3, column: 3, endLine: 3, endColumn: 4 }))).toEqual({
      from: 0,
      to: 0,
    });
  });
});

describe("versionIsOpen", () => {
  it("trusts a fetched text over the saved flag", () => {
    expect(versionIsOpen(true, "mine", "saved", "other")).toBe(false);
    expect(versionIsOpen(false, "mine", "saved", "mine")).toBe(true);
  });

  it("disables only the current version while the file equals the saved text", () => {
    expect(versionIsOpen(true, "saved", "saved", undefined)).toBe(true);
    expect(versionIsOpen(true, "edited", "saved", undefined)).toBe(false);
    expect(versionIsOpen(false, "saved", "saved", undefined)).toBe(false);
  });
});
