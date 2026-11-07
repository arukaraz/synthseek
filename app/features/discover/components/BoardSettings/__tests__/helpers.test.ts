import { describe, expect, it } from "vitest";

import { createWidget } from "@test/factories";

import { customWidgetsById } from "../../ExploreBoard/helpers";
import { densityChoices, sameAppearance, templateReportLines, textScaleChoices, withStagedWidgets } from "../helpers";
import type { ReadableTemplate } from "../types";

function report(overrides: Partial<ReadableTemplate> = {}): ReadableTemplate {
  return {
    ok: true,
    name: "Weekend crate digging",
    description: "",
    appearance: { density: "compact", text: "large" },
    tiles: 2,
    mobileTiles: 1,
    widgets: 1,
    skippedItems: [],
    rejectedWidgets: [],
    needs: [],
    blocked: null,
    layout: { items: [], mobile: [] },
    documents: [],
    ...overrides,
  };
}

describe("sameAppearance", () => {
  it("is the same look only when both the density and the text match", () => {
    expect(sameAppearance({ density: "compact", text: "large" }, { density: "compact", text: "large" })).toBe(true);
    expect(sameAppearance({ density: "compact", text: "large" }, { density: "compact", text: "small" })).toBe(false);
    expect(sameAppearance({ density: "compact", text: "large" }, { density: "spacious", text: "large" })).toBe(false);
  });
});

describe("withStagedWidgets", () => {
  it("adds a template's widgets to the member's, the template's winning on a shared id", () => {
    const own = createWidget({ id: "w_own" });
    const shared = createWidget({ id: "w_shared" });
    const staged = createWidget({ id: "w_shared", meta: { ...shared.meta, name: "From the template" } });
    const custom = customWidgetsById([own, shared]);

    const merged = withStagedWidgets(custom, [staged]);

    expect([...merged.keys()]).toEqual(["w_own", "w_shared"]);
    expect(merged.get("w_shared")?.meta.name).toBe("From the template");
    expect(withStagedWidgets(custom, [])).toBe(custom);
  });
});

describe("densityChoices and textScaleChoices", () => {
  it("offer every preset the board grid can draw, in its order", () => {
    expect(densityChoices()).toEqual(["compact", "comfortable", "spacious"]);
    expect(textScaleChoices()).toEqual(["small", "default", "large"]);
  });
});

describe("templateReportLines", () => {
  it("states what lands on each layout, the new widgets, the look and that it replaces the board", () => {
    expect(templateReportLines(report()).map((line) => [line.tone, line.text])).toEqual([
      ["info", "Weekend crate digging: 2 widgets on Desktop"],
      ["info", "1 widget on Mobile"],
      ["info", "1 new widget in My widgets"],
      ["info", "Look: Compact, Large text"],
      ["info", "Replaces your board and its look. You can undo right after."],
    ]);
  });

  it("warns about each skipped tile, rejected widget and missing connection, and leaves out zero new widgets", () => {
    const lines = templateReportLines(
      report({
        widgets: 0,
        skippedItems: [
          { list: "items", index: 2, reason: "unreadable" },
          { list: "mobile", index: 0, reason: "unreadable" },
        ],
        rejectedWidgets: [
          { index: 0, name: null, problems: [{ path: "view.block", problem: { code: "invalidField", reason: "x" } }] },
        ],
        needs: ["plex"],
      })
    );
    expect(lines.some((line) => line.key === "created")).toBe(false);
    expect(lines.filter((line) => line.tone === "warning").map((line) => line.text)).toEqual([
      "Tile 3 skipped: not a Synthseek widget",
      "Mobile tile 1 skipped: not a Synthseek widget",
      expect.stringMatching(/^Widget #1 skipped: /),
      { i18nKey: "customWidget.needs.plex", href: "/settings/connected-accounts#plex" },
    ]);
  });

  it("ends with the limit that stops the template instead of the replace note", () => {
    const lines = templateReportLines(report({ blocked: { reason: "widgetLimit", max: 24 } }));
    expect(lines.at(-1)).toEqual({
      key: "blocked",
      tone: "danger",
      text: "This would take you past 24 widgets. Delete some of yours first.",
    });
    expect(lines.some((line) => line.key === "replaces")).toBe(false);
  });
});
