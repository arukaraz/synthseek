import { describe, expect, it } from "vitest";

import { scrollRevealOf } from "../helpers";

describe("scrollRevealOf", () => {
  it("shows at the top of the page even after a move too small to count as scrolling up", () => {
    expect(scrollRevealOf(10, 4, 8)).toBe("show");
    expect(scrollRevealOf(14, 8, 8)).toBe("show");
  });

  it("hides once the reader moves down past the tolerance", () => {
    expect(scrollRevealOf(100, 109, 8)).toBe("hide");
  });

  it("shows again once the reader moves up past the tolerance", () => {
    expect(scrollRevealOf(300, 291, 8)).toBe("show");
  });

  it("keeps its state for a nudge inside the tolerance either way", () => {
    expect(scrollRevealOf(300, 308, 8)).toBe("keep");
    expect(scrollRevealOf(300, 292, 8)).toBe("keep");
  });
});
