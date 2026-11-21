import { describe, expect, it } from "vitest";

import { colorOf, makeDraft, surfaceFiles } from "../../../__tests__/fixtures";
import { barStatusOf, canSaveTheme, isOwnUndoField, isUndoShortcut, schemeMismatchOf } from "../helpers";

const key = { key: "z", ctrlKey: true, metaKey: false, shiftKey: false, altKey: false };

describe("schemeMismatchOf", () => {
  it("is null when scheme and surfaces agree", () => {
    expect(schemeMismatchOf(makeDraft())).toBeNull();
    expect(schemeMismatchOf(makeDraft({ scheme: "light" }, surfaceFiles(colorOf(0.98))))).toBeNull();
  });

  it("finds Light over dark surfaces", () => {
    expect(schemeMismatchOf(makeDraft({ scheme: "light" }))).toBe("lightOverDark");
  });

  it("finds Dark over light surfaces", () => {
    expect(schemeMismatchOf(makeDraft({ scheme: "dark" }, surfaceFiles(colorOf(0.98))))).toBe("darkOverLight");
  });

  it("is null when the surface cannot be read as a color", () => {
    expect(schemeMismatchOf(makeDraft({ scheme: "light" }, surfaceFiles("var(--x)")))).toBeNull();
  });

  it("draws the line at a luminance of 0.25", () => {
    expect(schemeMismatchOf(makeDraft({ scheme: "light" }, surfaceFiles(colorOf(0.55))))).toBe("lightOverDark");
    expect(schemeMismatchOf(makeDraft({ scheme: "light" }, surfaceFiles(colorOf(0.7))))).toBeNull();
  });
});

describe("barStatusOf", () => {
  it("puts a broken file before everything else", () => {
    expect(barStatusOf({ broken: ["a.css", "b.css"], saving: true, dirty: true })).toEqual({
      kind: "broken",
      file: "a.css",
      others: 1,
    });
  });

  it("reports saving, then unsaved, then saved", () => {
    expect(barStatusOf({ broken: [], saving: true, dirty: true })).toEqual({ kind: "saving" });
    expect(barStatusOf({ broken: [], saving: false, dirty: true })).toEqual({ kind: "unsaved" });
    expect(barStatusOf({ broken: [], saving: false, dirty: false })).toEqual({ kind: "saved" });
  });
});

describe("canSaveTheme", () => {
  it("needs changes, no save in flight and no broken file", () => {
    expect(canSaveTheme({ dirty: true, saving: false, broken: [] })).toBe(true);
    expect(canSaveTheme({ dirty: false, saving: false, broken: [] })).toBe(false);
    expect(canSaveTheme({ dirty: true, saving: true, broken: [] })).toBe(false);
    expect(canSaveTheme({ dirty: true, saving: false, broken: ["a.css"] })).toBe(false);
  });
});

describe("isUndoShortcut", () => {
  it("accepts Ctrl+Z and Cmd+Z in either case", () => {
    expect(isUndoShortcut(key)).toBe(true);
    expect(isUndoShortcut({ ...key, ctrlKey: false, metaKey: true })).toBe(true);
    expect(isUndoShortcut({ ...key, key: "Z" })).toBe(true);
  });

  it("refuses a bare Z, Shift+Ctrl+Z and Alt+Ctrl+Z", () => {
    expect(isUndoShortcut({ ...key, ctrlKey: false })).toBe(false);
    expect(isUndoShortcut({ ...key, shiftKey: true })).toBe(false);
    expect(isUndoShortcut({ ...key, altKey: true })).toBe(false);
  });

  it("refuses other letters", () => {
    expect(isUndoShortcut({ ...key, key: "y" })).toBe(false);
  });
});

describe("isOwnUndoField", () => {
  it("claims text inputs and textareas", () => {
    const text = document.createElement("input");
    text.type = "search";
    expect(isOwnUndoField(text)).toBe(true);
    expect(isOwnUndoField(document.createElement("textarea"))).toBe(true);
  });

  it("leaves checkboxes, sliders, color pickers and buttons to the card", () => {
    for (const type of ["checkbox", "range", "color", "radio"]) {
      const input = document.createElement("input");
      input.type = type;
      expect(isOwnUndoField(input)).toBe(false);
    }
    expect(isOwnUndoField(document.createElement("button"))).toBe(false);
    expect(isOwnUndoField(null)).toBe(false);
  });

  it("leaves an editable region such as the code editor to the card", () => {
    const region = document.createElement("div");
    region.contentEditable = "true";
    expect(isOwnUndoField(region)).toBe(false);
  });
});
