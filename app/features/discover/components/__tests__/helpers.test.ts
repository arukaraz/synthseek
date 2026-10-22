import { describe, expect, it } from "vitest";

import { cardRowFit, cardRowLimit } from "../helpers";

describe("cardRowLimit", () => {
  it("fits two cards in a half-width tile and four in a full-row one", () => {
    expect(cardRowLimit("M")).toBe(2);
    expect(cardRowLimit("L")).toBe(4);
    expect(cardRowLimit("L")).toBe(4);
  });
});

describe("cardRowFit", () => {
  it("counts the cards a row has room for, never fewer than two", () => {
    expect(cardRowFit(0, "L")).toBe(2);
    expect(cardRowFit(360, "M")).toBe(2);
    expect(cardRowFit(443, "M")).toBe(2);
    expect(cardRowFit(444, "M")).toBe(3);
    expect(cardRowFit(1400, "L")).toBe(8);
  });

  it("caps a half-width tile at four and a full row at the eight the server sends", () => {
    expect(cardRowFit(1400, "M")).toBe(4);
    expect(cardRowFit(5000, "L")).toBe(8);
  });
});
