// @vitest-environment node
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { ACCESSIBILITY_ATTRIBUTES } from "@modules/accessibility";

const CSS = readFileSync(join(resolve(process.cwd(), "app"), "theme", "utilities", "accessibility.css"), "utf8");
const ATTRIBUTE = `:root[${ACCESSIBILITY_ATTRIBUTES.buttonNames}="on"]`;

function ruleFor(selector: string): string {
  const start = CSS.indexOf(selector);
  if (start === -1) return "";
  return CSS.slice(start, CSS.indexOf("}", start) + 1);
}

describe("the button names stylesheet", () => {
  it("keeps the name hidden everywhere the setting is not on", () => {
    expect(ruleFor("[data-icon-button-name] {")).toContain("display: none");
  });

  it("shows the name only under the root attribute the setting writes", () => {
    expect(ruleFor(`${ATTRIBUTE} [data-icon-button] [data-icon-button-name]`)).toContain("display: block");
    expect(CSS).not.toMatch(/(^|\n)\[data-icon-button-name\] \{[^}]*display: (block|inline)/);
  });

  it("lets the button grow to hold its name instead of clipping it", () => {
    const rule = ruleFor(`${ATTRIBUTE} [data-icon-button] {`);

    expect(rule).toContain("width: auto");
    expect(rule).toContain("height: auto");
  });

  it("lets a row of buttons wrap instead of overflowing", () => {
    expect(ruleFor(`${ATTRIBUTE} :has(> [data-icon-button])`)).toContain("flex-wrap: wrap");
  });

  it("writes a player control's name from its own attribute, and only while the setting is on", () => {
    expect(ruleFor(`${ATTRIBUTE} [data-button-name]::after`)).toContain("content: attr(data-button-name)");
    expect(CSS.match(/content: attr\(data-button-name\)/g)).toHaveLength(1);
    expect(CSS).not.toMatch(/(^|\n)\[data-button-name\]/);
  });

  it("puts the name of a filled round control under it instead of growing the control", () => {
    expect(ruleFor(`${ATTRIBUTE} [data-button-name]:not([data-button-name-below])`)).toContain("width: auto");
    expect(ruleFor(`${ATTRIBUTE} [data-button-name-below]::after`)).toContain("position: absolute");
  });

  it("gives the wide player bar a second row and the height for it only while the setting is on", () => {
    const start = CSS.indexOf("--height-player-bar-wide");
    const block = CSS.slice(CSS.lastIndexOf("@media", start), start);

    expect(CSS.match(/--height-player-bar-wide/g)).toHaveLength(1);
    expect(block).toContain(`${ATTRIBUTE} {`);
    expect(ruleFor(`${ATTRIBUTE} [data-placement="dock"] > [data-names-area="bar-top"]`)).toContain("flex-wrap: wrap");
  });

  it("writes the attribute the primitive and the root agree on", () => {
    expect(ACCESSIBILITY_ATTRIBUTES.buttonNames).toBe("data-a11y-names");
  });
});
