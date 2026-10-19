import { describe, expect, it } from "vitest";

import { cardRowLimit } from "../helpers";

describe("cardRowLimit", () => {
  it("fits two cards in a half-width tile and four in a full-row one", () => {
    expect(cardRowLimit("M")).toBe(2);
    expect(cardRowLimit("L")).toBe(4);
    expect(cardRowLimit("XL")).toBe(4);
  });
});
