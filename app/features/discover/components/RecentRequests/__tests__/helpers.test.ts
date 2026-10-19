import { describe, expect, it } from "vitest";

import { requestLayoutFor } from "../helpers";

describe("requestLayoutFor", () => {
  it("uses compact rows for the half-width M size", () => {
    expect(requestLayoutFor("M")).toBe("row");
  });

  it("uses the tile grid for the full-row L size", () => {
    expect(requestLayoutFor("L")).toBe("tile");
  });
});
