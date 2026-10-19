import { describe, expect, it } from "vitest";

import { formatPlaycount, heroShapeFor } from "../helpers";

describe("heroShapeFor", () => {
  it("puts the hero beside the list for the half-height M size", () => {
    expect(heroShapeFor("M")).toBe("compact");
  });

  it("allows the hero to stack above the list for the tall M+ size", () => {
    expect(heroShapeFor("M+")).toBe("tall");
  });
});

describe("formatPlaycount", () => {
  it("returns plain integer under 1000", () => {
    expect(formatPlaycount(0)).toBe("0");
    expect(formatPlaycount(412)).toBe("412");
    expect(formatPlaycount(999)).toBe("999");
  });

  it("returns one-decimal k between 1000 and 10000", () => {
    expect(formatPlaycount(1234)).toBe("1.2k");
    expect(formatPlaycount(9876)).toBe("9.9k");
  });

  it("returns rounded k above 10000", () => {
    expect(formatPlaycount(15678)).toBe("16k");
    expect(formatPlaycount(412345)).toBe("412k");
  });
});
