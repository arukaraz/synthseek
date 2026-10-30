import { describe, expect, it } from "vitest";

import { densityChoices, templateReportLines, textScaleChoices } from "../helpers";
import type { ReadableTemplate } from "../types";

function report(overrides: Partial<ReadableTemplate> = {}): ReadableTemplate {
  return {
    ok: true,
    name: "Weekend crate digging",
    description: "",
    appearance: { density: "compact", text: "large" },
    tiles: 2,
    widgets: 1,
    skippedItems: [],
    rejectedWidgets: [],
    needs: [],
    blocked: null,
    ...overrides,
  };
}

describe("densityChoices and textScaleChoices", () => {
  it("offer every preset the board grid can draw, in its order", () => {
    expect(densityChoices()).toEqual(["compact", "comfortable", "spacious"]);
    expect(textScaleChoices()).toEqual(["small", "default", "large"]);
  });
});

describe("templateReportLines", () => {
  it("states what lands on the board, the new widgets, the look and that it replaces the board", () => {
    expect(templateReportLines(report()).map((line) => [line.tone, line.text])).toEqual([
      ["info", "Weekend crate digging: 2 widgets on the board"],
      ["info", "1 new widget in My widgets"],
      ["info", "Look: Compact, Large text"],
      ["info", "Replaces your board and its look. You can undo right after."],
    ]);
  });

  it("warns about each skipped tile, rejected widget and missing connection, and leaves out zero new widgets", () => {
    const lines = templateReportLines(
      report({
        widgets: 0,
        skippedItems: [{ index: 2, reason: "unreadable" }],
        rejectedWidgets: [
          { index: 0, name: null, problems: [{ path: "view.block", problem: { code: "invalidField", reason: "x" } }] },
        ],
        needs: ["plex"],
      })
    );
    expect(lines.some((line) => line.key === "created")).toBe(false);
    expect(lines.filter((line) => line.tone === "warning").map((line) => line.text)).toEqual([
      "Tile 3 skipped: not a Synthseek widget",
      expect.stringMatching(/^Widget #1 skipped: /),
      "This widget needs Plex connected for the household and your Plex account linked under Connected accounts.",
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
