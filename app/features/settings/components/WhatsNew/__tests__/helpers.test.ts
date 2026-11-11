import { afterEach, describe, expect, it } from "vitest";

import { anotherDialogOpen, cardTotal, clampCard, segmentState } from "../helpers";
import { makeWhatsNewEntry } from "./fixtures";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("cardTotal", () => {
  it("counts one card per highlight plus the summary card", () => {
    expect(cardTotal(makeWhatsNewEntry())).toBe(3);
  });

  it("leaves only the summary card when the entry has no highlights", () => {
    expect(cardTotal(makeWhatsNewEntry({ highlights: undefined }))).toBe(1);
  });
});

describe("clampCard", () => {
  it("keeps the index inside the deck", () => {
    expect(clampCard(-1, 3)).toBe(0);
    expect(clampCard(1, 3)).toBe(1);
    expect(clampCard(5, 3)).toBe(2);
  });
});

describe("segmentState", () => {
  it("marks the cards before, at and after the current one", () => {
    expect(segmentState(0, 1)).toBe("done");
    expect(segmentState(1, 1)).toBe("current");
    expect(segmentState(2, 1)).toBe("todo");
  });
});

describe("anotherDialogOpen", () => {
  it("sees an open dialog and ignores a closed one", () => {
    document.body.innerHTML = '<div role="dialog" data-state="closed"></div>';
    expect(anotherDialogOpen()).toBe(false);

    document.body.innerHTML = '<div role="dialog" data-state="open"></div>';
    expect(anotherDialogOpen()).toBe(true);
  });

  it("sees an open alert dialog", () => {
    document.body.innerHTML = '<div role="alertdialog" data-state="open"></div>';
    expect(anotherDialogOpen()).toBe(true);
  });
});
