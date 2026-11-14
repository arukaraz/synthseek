import { describe, expect, it } from "vitest";

import { boardMetricsOf } from "../helpers";

describe("boardMetricsOf", () => {
  it("falls back to the comfortable row and gap without an appearance", () => {
    expect(boardMetricsOf()).toEqual({ rowPx: 72, gapPx: 16 });
  });

  it("takes the row and the gap from the density", () => {
    expect(boardMetricsOf({ density: "compact", text: "default" })).toEqual({ rowPx: 64, gapPx: 12 });
    expect(boardMetricsOf({ density: "spacious", text: "large" })).toEqual({ rowPx: 80, gapPx: 24 });
  });
});
