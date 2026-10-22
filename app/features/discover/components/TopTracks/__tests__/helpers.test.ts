import { describe, expect, it } from "vitest";

import { formatPlaycount } from "../helpers";

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
