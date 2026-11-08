import { describe, expect, it } from "vitest";

import { alphabetIndexSlots, slotIndexAt } from "../helpers";

const ENTRIES = [
  { letter: "A", offset: 0 },
  { letter: "D", offset: 7 },
];

function targetOf(letter: string, descending: boolean) {
  return alphabetIndexSlots(ENTRIES, descending).find((slot) => slot.letter === letter)?.target ?? null;
}

describe("alphabetIndexSlots", () => {
  it("offers every letter, sending a missing one to the next letter that has entries", () => {
    const slots = alphabetIndexSlots(ENTRIES, false);

    expect(slots.map((slot) => slot.letter).join("")).toBe("#ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    expect(targetOf("A", false)).toEqual({ letter: "A", offset: 0 });
    expect(targetOf("B", false)).toEqual({ letter: "D", offset: 7 });
    expect(targetOf("#", false)).toEqual({ letter: "A", offset: 0 });
    expect(targetOf("E", false)).toBeNull();
  });

  it("reverses the strip when descending, so a missing letter targets the next entry in that order", () => {
    const slots = alphabetIndexSlots(ENTRIES, true);

    expect(slots[0].letter).toBe("Z");
    expect(slots.at(-1)?.letter).toBe("#");
    expect(targetOf("C", true)).toEqual({ letter: "A", offset: 0 });
    expect(targetOf("Z", true)).toEqual({ letter: "D", offset: 7 });
    expect(targetOf("#", true)).toBeNull();
  });
});

describe("slotIndexAt", () => {
  const rect = new DOMRect(0, 100, 20, 270);

  it("maps a point to the slot it falls in", () => {
    expect(slotIndexAt(100, rect, 27)).toBe(0);
    expect(slotIndexAt(109, rect, 27)).toBe(0);
    expect(slotIndexAt(110, rect, 27)).toBe(1);
    expect(slotIndexAt(235, rect, 27)).toBe(13);
  });

  it("clamps a point above or below the strip to its first or last slot", () => {
    expect(slotIndexAt(40, rect, 27)).toBe(0);
    expect(slotIndexAt(370, rect, 27)).toBe(26);
    expect(slotIndexAt(900, rect, 27)).toBe(26);
  });

  it("stays finite on a strip that has not been laid out", () => {
    expect(slotIndexAt(100, new DOMRect(0, 100, 0, 0), 27)).toBe(0);
    expect(slotIndexAt(101, new DOMRect(0, 100, 0, 0), 27)).toBe(26);
  });
});
