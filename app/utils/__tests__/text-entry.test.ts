import { describe, expect, it } from "vitest";

import { isTextEntryTarget } from "../text-entry";

function input(type: string): HTMLInputElement {
  const element = document.createElement("input");
  element.type = type;
  return element;
}

describe("isTextEntryTarget", () => {
  it("is true where keys become text", () => {
    expect(isTextEntryTarget(input("text"))).toBe(true);
    expect(isTextEntryTarget(input("search"))).toBe(true);
    expect(isTextEntryTarget(document.createElement("textarea"))).toBe(true);
    expect(isTextEntryTarget(document.createElement("select"))).toBe(true);
  });

  it("is true inside an element that acts as a text box", () => {
    const box = document.createElement("div");
    box.setAttribute("role", "searchbox");
    const inner = document.createElement("span");
    box.appendChild(inner);

    expect(isTextEntryTarget(inner)).toBe(true);
  });

  it("is false for controls that take no text, and for anything that is not an element", () => {
    expect(isTextEntryTarget(input("checkbox"))).toBe(false);
    expect(isTextEntryTarget(input("button"))).toBe(false);
    expect(isTextEntryTarget(document.createElement("button"))).toBe(false);
    expect(isTextEntryTarget(null)).toBe(false);
    expect(isTextEntryTarget(window)).toBe(false);
  });
});
