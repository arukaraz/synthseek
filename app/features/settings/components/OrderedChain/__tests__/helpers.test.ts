import { describe, expect, it } from "vitest";

import { movedKey } from "../helpers";

const ORDER = ["a", "b", "c", "d"] as const;

type Key = (typeof ORDER)[number];

function swapped(index: number, offset: -1 | 1): Key[] {
  const next: Key[] = [...ORDER];
  const target = index + offset;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

describe("movedKey", () => {
  it.each([
    ["b", 1],
    ["c", 2],
    ["d", 3],
  ] as const)("moves %s from %i one place up", (key, index) => {
    expect(movedKey(ORDER, key, -1)).toEqual(swapped(index, -1));
  });

  it.each([
    ["a", 0],
    ["b", 1],
    ["c", 2],
  ] as const)("moves %s from %i one place down", (key, index) => {
    expect(movedKey(ORDER, key, 1)).toEqual(swapped(index, 1));
  });

  it("leaves the first key in place when moved up", () => {
    expect(movedKey(ORDER, "a", -1)).toEqual([...ORDER]);
  });

  it("leaves the last key in place when moved down", () => {
    expect(movedKey(ORDER, "d", 1)).toEqual([...ORDER]);
  });

  it("leaves the order alone for a key that is not in it", () => {
    const order: string[] = ["a", "b"];
    expect(movedKey(order, "z", 1)).toEqual(["a", "b"]);
    expect(movedKey(order, "z", -1)).toEqual(["a", "b"]);
  });

  it("returns a new array without touching the input", () => {
    const order: Key[] = [...ORDER];
    const unchanged = movedKey(order, "a", -1);
    const moved = movedKey(order, "b", 1);
    expect(unchanged).not.toBe(order);
    expect(moved).not.toBe(order);
    expect(order).toEqual([...ORDER]);
  });
});
