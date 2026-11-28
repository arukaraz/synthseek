import { describe, expect, it } from "vitest";

import { scrollRegionProps } from "../scroll-region";

describe("scrollRegionProps", () => {
  it("adds nothing while the container does not overflow, so it is not an extra tab stop", () => {
    expect(scrollRegionProps(false, "Table")).toEqual({});
  });

  it("names the container and makes it reachable by keyboard once it overflows", () => {
    expect(scrollRegionProps(true, "Table, scrolls sideways")).toEqual({
      role: "region",
      tabIndex: 0,
      "aria-label": "Table, scrolls sideways",
    });
  });
});
