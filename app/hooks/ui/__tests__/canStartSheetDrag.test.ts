import { afterEach, describe, expect, it } from "vitest";

import { canStartSheetDrag } from "../helpers";

function scrolledBy(element: HTMLElement, scrollTop: number): HTMLElement {
  Object.defineProperty(element, "scrollTop", { value: scrollTop, configurable: true });
  return element;
}

function sheetWith(markup: string): HTMLElement {
  const sheet = document.createElement("div");
  sheet.innerHTML = markup;
  document.body.append(sheet);
  return sheet;
}

function byId(sheet: HTMLElement, id: string): HTMLElement {
  const element = sheet.querySelector<HTMLElement>(`#${id}`);
  if (!element) throw new Error(`missing #${id}`);
  return element;
}

describe("canStartSheetDrag", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("lets a drag start anywhere plain inside the sheet, the sheet itself included", () => {
    const sheet = sheetWith(`<div><span id="leaf">x</span></div>`);

    expect(canStartSheetDrag(byId(sheet, "leaf"), sheet)).toBe(true);
    expect(canStartSheetDrag(sheet, sheet)).toBe(true);
  });

  it("refuses a target that is not an element", () => {
    const sheet = sheetWith("text");

    expect(canStartSheetDrag(null, sheet)).toBe(false);
    expect(canStartSheetDrag(sheet.firstChild, sheet)).toBe(false);
  });

  it("refuses a drag that starts inside a no-drag zone", () => {
    const sheet = sheetWith(`<div data-sheet-no-drag><button id="inner">x</button></div>`);

    expect(canStartSheetDrag(byId(sheet, "inner"), sheet)).toBe(false);
  });

  it("refuses a drag inside a scroll area that is scrolled away from its top", () => {
    const sheet = sheetWith(`<div id="list" style="overflow-y: auto"><p id="row">x</p></div>`);
    scrolledBy(byId(sheet, "list"), 40);

    expect(canStartSheetDrag(byId(sheet, "row"), sheet)).toBe(false);
  });

  it("refuses the same for an always-scrolling area", () => {
    const sheet = sheetWith(`<div id="list" style="overflow-y: scroll"><p id="row">x</p></div>`);
    scrolledBy(byId(sheet, "list"), 1);

    expect(canStartSheetDrag(byId(sheet, "row"), sheet)).toBe(false);
  });

  it("allows a drag inside a scroll area resting at its top", () => {
    const sheet = sheetWith(`<div id="list" style="overflow-y: auto"><p id="row">x</p></div>`);

    expect(canStartSheetDrag(byId(sheet, "row"), sheet)).toBe(true);
  });

  it("ignores a scroll offset on an element that does not scroll", () => {
    const sheet = sheetWith(`<div id="box" style="overflow-y: hidden"><p id="row">x</p></div>`);
    scrolledBy(byId(sheet, "box"), 40);

    expect(canStartSheetDrag(byId(sheet, "row"), sheet)).toBe(true);
  });

  it("stops looking at the sheet, so a scrolled page around it does not matter", () => {
    const page = scrolledBy(document.createElement("div"), 300);
    page.style.overflowY = "auto";
    const sheet = document.createElement("div");
    sheet.innerHTML = `<p id="row">x</p>`;
    page.append(sheet);
    document.body.append(page);

    expect(canStartSheetDrag(byId(sheet, "row"), sheet)).toBe(true);
  });
});
