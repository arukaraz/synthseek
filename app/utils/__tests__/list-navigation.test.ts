import { describe, expect, it } from "vitest";

import { stepIndex } from "../list-navigation";

describe("stepIndex", () => {
  it("moves one row and wraps past either end", () => {
    expect(stepIndex(1, 1, 4)).toBe(2);
    expect(stepIndex(3, 1, 4)).toBe(0);
    expect(stepIndex(0, -1, 4)).toBe(3);
  });

  it("stays on the first row when the list is empty", () => {
    expect(stepIndex(2, 1, 0)).toBe(0);
  });
});
