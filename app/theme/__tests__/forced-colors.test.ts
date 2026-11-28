// @vitest-environment node
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { statusDotTone } from "@features/library/components/LibraryCard/helpers";

interface Rule {
  selectors: string[];
  declarations: Record<string, string>;
}

const CSS = readFileSync(join(resolve(process.cwd(), "app"), "theme", "utilities", "accessibility.css"), "utf8");
const MEDIA = "@media (forced-colors: active)";

function forcedColorsBlock(): string {
  const start = CSS.indexOf(MEDIA);
  if (start === -1) return "";
  let depth = 0;
  for (let index = CSS.indexOf("{", start); index < CSS.length; index += 1) {
    if (CSS[index] === "{") depth += 1;
    if (CSS[index] === "}") depth -= 1;
    if (depth === 0) return CSS.slice(start, index + 1);
  }
  return CSS.slice(start);
}

function parseRules(block: string): Rule[] {
  const inner = block.slice(block.indexOf("{") + 1, block.lastIndexOf("}"));
  return inner
    .split("}")
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk !== "")
    .map((chunk) => {
      const [head = "", body = ""] = chunk.split("{");
      const declarations: Record<string, string> = {};
      for (const declaration of body.split(";")) {
        const colon = declaration.indexOf(":");
        if (colon === -1) continue;
        declarations[declaration.slice(0, colon).trim()] = declaration.slice(colon + 1).trim();
      }
      return {
        selectors: head
          .split(",")
          .map((selector) => selector.trim())
          .filter((selector) => selector !== ""),
        declarations,
      };
    });
}

const BLOCK = forcedColorsBlock();
const RULES = parseRules(BLOCK);
const SYSTEM_COLOR = /\b(Highlight|HighlightText|CanvasText|Canvas|ButtonText|Mark)\b/;
const ANY_SYSTEM_COLOR = new RegExp(SYSTEM_COLOR.source, "g");

function declarationsFor(selector: string): Record<string, string> {
  return Object.assign(
    {},
    ...RULES.filter((rule) => rule.selectors.includes(selector)).map((rule) => rule.declarations)
  );
}

function paint(selector: string, property: string): string {
  return declarationsFor(selector)[property] ?? "";
}

function systemColoursOf(value: string): string[] {
  return value.match(ANY_SYSTEM_COLOR) ?? [];
}

describe("the forced colours block", () => {
  it("exists, and sits only inside the operating system's own mode", () => {
    expect(BLOCK).not.toBe("");
    expect(RULES.length).toBeGreaterThan(0);
    expect(CSS.split(MEDIA)).toHaveLength(2);
  });

  it("draws the focus ring in the system highlight colour, never removes it", () => {
    const outline = paint(":focus-visible", "outline");

    expect(outline).toMatch(/^\d+px solid Highlight$/);
    expect(outline).not.toContain("none");
  });

  it.each([
    ['[aria-pressed="true"]', "pressed buttons"],
    ['[aria-selected="true"]', "selected tabs and rows"],
    ['[aria-current="page"]', "the current page"],
    ['[data-state="active"]', "the active tab"],
  ])("paints %s, the %s, as a selection and keeps the browser from undoing it", (selector) => {
    const declarations = declarationsFor(selector);

    expect(declarations["background-color"]).toBe("Highlight");
    expect(declarations["color"]).toBe("HighlightText");
    expect(declarations["forced-color-adjust"]).toBe("none");
  });

  it.each([
    ['[role="switch"]', "toggles"],
    ['[role="slider"]', "sliders"],
    ['[role="progressbar"]', "progress bars"],
  ])("outlines %s, the %s, in a system colour", (selector) => {
    const declarations = declarationsFor(selector);

    expect(systemColoursOf(`${declarations["border"] ?? ""} ${declarations["border-color"] ?? ""}`)).not.toEqual([]);
    expect(declarations["border"] ?? declarations["border-color"]).not.toContain("none");
  });

  it("shows a switched-on toggle differently from a switched-off one", () => {
    const off = paint('[role="switch"]', "background-color");
    const on = paint('[role="switch"][aria-checked="true"]', "background-color");

    expect(on).toBe("Highlight");
    expect(off).not.toBe(on);
  });

  it("fills the part of a progress bar that is done in the highlight colour", () => {
    expect(paint('[role="progressbar"] > *', "background")).toBe("Highlight");
  });

  it("turns colour adjustment off only on things where a colour carries meaning", () => {
    const rules = RULES.filter((rule) => rule.declarations["forced-color-adjust"] === "none");

    expect(rules.length).toBeGreaterThan(0);
    for (const rule of rules) {
      const painted = Object.entries(rule.declarations)
        .filter(([property]) => property !== "forced-color-adjust")
        .map(([, value]) => value)
        .join(" ");
      expect(painted).toMatch(SYSTEM_COLOR);
    }
  });

  it("paints with system colour keywords and no colour of its own", () => {
    expect(BLOCK).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(BLOCK).not.toContain("oklch(");
    expect(BLOCK).not.toContain("var(--");
    expect(BLOCK).not.toMatch(/\brgba?\(/);
  });

  it("tells every status tone the app emits apart from the others", () => {
    const tones = new Set(
      (["complete", "failed", "downloading", "delegated"] as const).map((status) => statusDotTone(status))
    );
    const looks = ["complete", "failed", "active"].map((tone) => {
      const declarations = declarationsFor(`[data-status-dot="${tone}"]`);
      return `${declarations["background-color"]}|${declarations["border-color"]}`;
    });
    const idle = declarationsFor("[data-status-dot]");

    expect(tones).toEqual(new Set(["complete", "failed", "active", "idle"]));
    expect(looks.every((look) => !look.includes("undefined"))).toBe(true);
    expect(
      new Set([...looks, `${idle["background-color"]}|${idle["border-color"] ?? ""}`]).size
    ).toBeGreaterThanOrEqual(3);
    expect(declarationsFor('[data-status-dot="failed"]')["background-color"]).toBe("Canvas");
    expect(declarationsFor('[data-status-dot="complete"]')["background-color"]).toBe("Highlight");
    expect(idle["background-color"]).toBe("CanvasText");
  });
});
