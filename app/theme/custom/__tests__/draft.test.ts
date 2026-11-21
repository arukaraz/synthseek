// @vitest-environment node
import { THEME_CONTRACT, THEME_PRESETS } from "@theme/contract";
import { describe, expect, it } from "vitest";

import {
  changedPaths,
  draftValues,
  exportDocument,
  isFreePath,
  isTokenPath,
  removedPaths,
  sameDraft,
  tokenPathOf,
  withImport,
  withPreset,
} from "../draft";
import { valuesOf } from "../declarations";
import type { ThemeDraft } from "../types";

import { oklch, presetDraft, presetFiles, presetFollows } from "./fixtures";

function withFiles(draft: ThemeDraft, files: Record<string, string>): ThemeDraft {
  return { ...draft, files: { ...draft.files, ...files } };
}

describe("paths", () => {
  it("recognises token files", () => {
    expect(isTokenPath("tokens/brand.css")).toBe(true);
    expect(isTokenPath("tokens/.css")).toBe(false);
    expect(isTokenPath("tokens/a/b.css")).toBe(false);
    expect(isTokenPath("tokens/brand.txt")).toBe(false);
    expect(isTokenPath("components/brand.css")).toBe(false);
    expect(isTokenPath("custom.css")).toBe(false);
  });

  it("recognises free css files", () => {
    expect(isFreePath("custom.css")).toBe(true);
    expect(isFreePath("components/player.css")).toBe(true);
    expect(isFreePath("components/.css")).toBe(false);
    expect(isFreePath("components/a/b.css")).toBe(false);
    expect(isFreePath("components/player.js")).toBe(false);
    expect(isFreePath("tokens/brand.css")).toBe(false);
  });

  it("builds the path of a token file", () => {
    expect(tokenPathOf("brand")).toBe("tokens/brand.css");
    expect(isTokenPath(tokenPathOf("content-types"))).toBe(true);
  });
});

describe("sameDraft", () => {
  const base = presetDraft();

  it("is true for equal drafts, whatever the order of follows and files", () => {
    const reordered: ThemeDraft = {
      meta: { ...base.meta, follows: [...base.meta.follows].reverse() },
      files: Object.fromEntries(Object.entries(base.files).reverse()),
    };
    expect(sameDraft(base, reordered)).toBe(true);
  });

  it("is false when the name, scheme or preset differ", () => {
    expect(sameDraft(base, { ...base, meta: { ...base.meta, name: "Other" } })).toBe(false);
    expect(sameDraft(base, { ...base, meta: { ...base.meta, scheme: "light" } })).toBe(false);
    expect(sameDraft(base, { ...base, meta: { ...base.meta, startedFrom: "ocean" } })).toBe(false);
  });

  it("is false when follows differ in membership or size", () => {
    const fewer = { ...base, meta: { ...base.meta, follows: base.meta.follows.slice(1) } };
    expect(sameDraft(base, fewer)).toBe(false);
    expect(sameDraft(fewer, base)).toBe(false);
    const swapped = [...base.meta.follows.slice(1), "--other"];
    expect(sameDraft(base, { ...base, meta: { ...base.meta, follows: swapped } })).toBe(false);
  });

  it("is false when a file changes, appears or disappears", () => {
    expect(sameDraft(base, withFiles(base, { "tokens/brand.css": ":root {}" }))).toBe(false);
    expect(sameDraft(base, withFiles(base, { "custom.css": "a {}" }))).toBe(false);
    const { "tokens/brand.css": _removed, ...rest } = base.files;
    expect(sameDraft(base, { ...base, files: rest })).toBe(false);
  });

  it("is false when the same number of files carry different paths", () => {
    const { "tokens/brand.css": brand, ...rest } = base.files;
    expect(sameDraft(base, { ...base, files: { ...rest, "components/x.css": brand } })).toBe(false);
  });
});

describe("changedPaths and removedPaths", () => {
  const saved = withFiles(presetDraft(), { "custom.css": "a {}", "components/gone.css": "b {}" });

  it("lists the changed and the new files", () => {
    const draft = withFiles(saved, { "custom.css": "a { x: 1 }", "components/new.css": "c {}" });
    expect(changedPaths(saved, draft)).toEqual(["components/new.css", "custom.css"]);
  });

  it("lists nothing for an identical draft", () => {
    expect(changedPaths(saved, saved)).toEqual([]);
    expect(removedPaths(saved, saved)).toEqual([]);
  });

  it("lists the files that were saved and are gone", () => {
    const { "components/gone.css": _gone, ...files } = saved.files;
    expect(removedPaths(saved, { ...saved, files })).toEqual(["components/gone.css"]);
    expect(changedPaths(saved, { ...saved, files })).toEqual([]);
  });
});

describe("draftValues", () => {
  it("returns every token of the preset for an untouched draft", () => {
    const values = draftValues(presetDraft("ocean"));
    for (const [name, value] of Object.entries(THEME_PRESETS.ocean)) expect(values.get(name), name).toBe(value);
  });

  it("takes the value a token file declares over the preset", () => {
    const draft = withFiles(presetDraft(), { "tokens/brand.css": ":root { --color-primary-500: red; }" });
    expect(draftValues(draft).get("--color-primary-500")).toBe("red");
  });

  it("falls back to the preset for a token the files leave out", () => {
    const draft = withFiles(presetDraft("midnight"), { "tokens/brand.css": ":root { --color-primary-500: red; }" });
    expect(draftValues(draft).get("--color-primary-600")).toBe(THEME_PRESETS.midnight["--color-primary-600"]);
  });

  it("ignores the declarations of a free file", () => {
    const draft = withFiles(presetDraft(), { "custom.css": ":root { --surface-bg: red; }" });
    expect(draftValues(draft).get("--surface-bg")).toBe(THEME_PRESETS.dark["--surface-bg"]);
  });
});

describe("exportDocument", () => {
  const draft = withFiles(presetDraft("ocean"), {
    "custom.css": "a {}",
    "components/x.css": "b {}",
    "stray.txt": "no",
  });

  it("carries the meta, the contract version and every token file", () => {
    const document = exportDocument(draft, { includeFreeCss: false });
    expect(document).toMatchObject({
      synthseek: "theme",
      contract: THEME_CONTRACT.version,
      name: "Mine",
      scheme: "dark",
      startedFrom: "ocean",
    });
    expect(document.follows).toEqual(presetFollows());
    expect(Object.keys(document.files).sort()).toEqual(THEME_CONTRACT.files.map((file) => file.path).sort());
  });

  it("adds the free files only when asked, and never an unknown file", () => {
    const document = exportDocument(draft, { includeFreeCss: true });
    expect(document.files["custom.css"]).toBe("a {}");
    expect(document.files["components/x.css"]).toBe("b {}");
    expect(Object.keys(document.files)).not.toContain("stray.txt");
  });

  it("does not share the follows list with the draft", () => {
    const document = exportDocument(draft, { includeFreeCss: false });
    document.follows.push("--x");
    expect(draft.meta.follows).not.toContain("--x");
  });
});

describe("withPreset", () => {
  const preset = { files: presetFiles("midnight"), follows: ["--only-this"] };

  it("replaces every token file and the follows, and sets the preset", () => {
    const draft = withFiles(presetDraft(), { "tokens/brand.css": ":root { --color-primary-500: red; }" });
    const next = withPreset(draft, preset, "midnight");
    expect(next.meta.startedFrom).toBe("midnight");
    expect(next.meta.follows).toEqual(["--only-this"]);
    expect(next.files["tokens/brand.css"]).toBe(preset.files.find((file) => file.path === "tokens/brand.css")?.text);
    expect(draftValues(next).get("--color-primary-500")).toBe(THEME_PRESETS.midnight["--color-primary-500"]);
  });

  it("leaves the name, the scheme and the free css", () => {
    const draft = withFiles(
      { ...presetDraft(), meta: { ...presetDraft().meta, name: "Keep", scheme: "light" } },
      { "custom.css": "a {}", "components/x.css": "b {}" }
    );
    const next = withPreset(draft, preset, "midnight");
    expect(next.meta.name).toBe("Keep");
    expect(next.meta.scheme).toBe("light");
    expect(next.files["custom.css"]).toBe("a {}");
    expect(next.files["components/x.css"]).toBe("b {}");
  });

  it("drops a token file the preset does not carry", () => {
    const draft = withFiles(presetDraft(), { "tokens/extra.css": ":root { --x: 1; }" });
    expect(Object.keys(withPreset(draft, preset, "midnight").files)).not.toContain("tokens/extra.css");
  });
});

describe("withImport", () => {
  const brandText = `:root { --color-primary-500: ${oklch("0.5 0.2 100")}; }`;
  const imported = {
    name: "Imported",
    scheme: "light" as const,
    startedFrom: "ocean" as const,
    follows: ["--a"],
    files: [
      { path: "tokens/brand.css", text: brandText },
      { path: "custom.css", text: "i {}" },
      { path: "components/i.css", text: "j {}" },
      { path: "elsewhere.txt", text: "no" },
    ],
  };
  const draft = withFiles(presetDraft(), { "custom.css": "mine {}", "components/m.css": "m {}" });

  it("takes the meta and replaces the imported token files only", () => {
    const next = withImport(draft, imported, true);
    expect(next.meta).toEqual({ name: "Imported", scheme: "light", startedFrom: "ocean", follows: ["--a"] });
    expect(next.files["tokens/brand.css"]).toBe(brandText);
    expect(next.files["tokens/surfaces.css"]).toBe(draft.files["tokens/surfaces.css"]);
  });

  it("keeps the draft's free css when only tokens are taken", () => {
    const next = withImport(draft, imported, true);
    expect(next.files["custom.css"]).toBe("mine {}");
    expect(Object.keys(next.files)).not.toContain("components/i.css");
  });

  it("takes the imported free css too, but never an unknown file", () => {
    const next = withImport(draft, imported, false);
    expect(next.files["custom.css"]).toBe("i {}");
    expect(next.files["components/i.css"]).toBe("j {}");
    expect(next.files["components/m.css"]).toBe("m {}");
    expect(Object.keys(next.files)).not.toContain("elsewhere.txt");
    expect(valuesOf(next.files["tokens/brand.css"]).get("--color-primary-500")).toBe(oklch("0.5 0.2 100"));
  });
});
