import { describe, expect, it } from "vitest";

import { VIEW_CONFIG } from "../../../constants";
import { revealSelectedTab, shelfActiveChips } from "../helpers";

function scrollerWith(scrollLeft: number, scrollerRect: DOMRect, tabRect: DOMRect | null): HTMLElement {
  const scroller = document.createElement("div");
  Object.defineProperty(scroller, "scrollLeft", { value: scrollLeft, writable: true });
  scroller.getBoundingClientRect = () => scrollerRect;
  const idle = document.createElement("button");
  idle.setAttribute("aria-selected", "false");
  idle.getBoundingClientRect = () => new DOMRect(0, 0, 80, 40);
  scroller.append(idle);
  if (tabRect) {
    const tab = document.createElement("button");
    tab.setAttribute("aria-selected", "true");
    tab.getBoundingClientRect = () => tabRect;
    scroller.append(tab);
  }
  return scroller;
}

describe("revealSelectedTab", () => {
  it("scrolls so the selected tab sits in the middle of the scroller", () => {
    const scroller = scrollerWith(40, new DOMRect(20, 0, 300, 40), new DOMRect(520, 0, 100, 40));

    revealSelectedTab(scroller);

    expect(scroller.scrollLeft).toBe(440);
  });

  it("never scrolls before the start when the selected tab is near the left edge", () => {
    const scroller = scrollerWith(0, new DOMRect(0, 0, 300, 40), new DOMRect(10, 0, 50, 40));

    revealSelectedTab(scroller);

    expect(scroller.scrollLeft).toBe(0);
  });

  it("leaves the scroller alone when no tab is selected", () => {
    const scroller = scrollerWith(75, new DOMRect(0, 0, 300, 40), null);

    revealSelectedTab(scroller);

    expect(scroller.scrollLeft).toBe(75);
  });

  it("tolerates a missing scroller", () => {
    expect(() => revealSelectedTab(null)).not.toThrow();
  });
});

describe("shelfActiveChips", () => {
  const label = (def: { key: string }, value: string) => `${def.key}=${value}`;

  it("produces one chip per active value, in facet order, labelled from that facet's values", () => {
    const chips = shelfActiveChips(
      VIEW_CONFIG.albums.facets,
      { year: ["1999"], genre: ["rock", "jazz"] },
      { genre: [{ value: "rock", label: "Rock", count: 3 }] },
      (def, value, values) => values.find((entry) => entry.value === value)?.label ?? label(def, value)
    );

    expect(chips).toEqual([
      { key: "genre", value: "rock", label: "Rock" },
      { key: "genre", value: "jazz", label: "genre=jazz" },
      { key: "year", value: "1999", label: "year=1999" },
    ]);
  });

  it("ignores filter keys that are not facets of the view", () => {
    expect(shelfActiveChips(VIEW_CONFIG.albums.facets, { orphan: ["true"] }, {}, label)).toEqual([]);
  });
});
