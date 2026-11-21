// @vitest-environment node
import { describe, expect, it } from "vitest";

import * as custom from "..";
import { CUSTOM_FILE, THEME_SCOPE_SELECTOR, TOKENS_DIRECTORY } from "../constants";
import { scanDeclarations } from "../declarations";
import { isFreePath, isTokenPath } from "../draft";
import { tokenBlock } from "../sheet";

describe("the public surface", () => {
  it("re-exports the logic of every module", () => {
    for (const name of [
      "parseColor",
      "formatOklch",
      "toHex",
      "fromHex",
      "relativeLuminance",
      "contrastRatio",
      "followedColor",
      "scanDeclarations",
      "valuesOf",
      "setDeclaration",
      "isInertValue",
      "tokenBlock",
      "isTokenPath",
      "isFreePath",
      "tokenPathOf",
      "sameDraft",
      "changedPaths",
      "removedPaths",
      "draftValues",
      "exportDocument",
      "withPreset",
      "withImport",
      "setToken",
      "resetToken",
      "isTokenChanged",
      "lightSet",
      "emptyUndoLog",
      "recordSnapshot",
      "undoStep",
      "redoStep",
      "canUndo",
      "canRedo",
    ]) {
      expect(typeof new Map(Object.entries(custom)).get(name), name).toBe("function");
    }
  });

  it("re-exports the constants the modules agree on", () => {
    expect(custom.THEME_SCOPE_SELECTOR).toBe(THEME_SCOPE_SELECTOR);
    expect(custom.UNDO_GROUP_MS).toBeGreaterThan(0);
    expect(custom.UNDO_MAX_STEPS).toBeGreaterThan(0);
    expect(custom.CONTRAST_MINIMUM).toBe(4.5);
    expect(custom.COMPONENTS_DIRECTORY).toBe("components/");
  });
});

describe("the constants the modules agree on", () => {
  it("scope the sheet to the custom theme", () => {
    const block = tokenBlock([{ path: `${TOKENS_DIRECTORY}a.css`, text: ":root { --a: 1; }" }]);
    expect(block.startsWith(THEME_SCOPE_SELECTOR)).toBe(true);
    expect(scanDeclarations(":root { --a: 1; }")).toHaveLength(1);
  });

  it("name the folders and the free file the path checks look for", () => {
    expect(isTokenPath(`${TOKENS_DIRECTORY}a.css`)).toBe(true);
    expect(isFreePath(CUSTOM_FILE)).toBe(true);
  });
});
